'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowsClockwise, ArrowUp, CookingPot, Heart, Sparkle, Trash } from '@phosphor-icons/react';
import { formatApiError, recipesApi, type ChatMessage, type Recipe } from '@/lib/api';
import { useAuthStore } from '@/lib/stores';
import { PageHeading } from './ui';
import { useWorkspace } from './workspace';
import s from './workspace.module.css';

const suggestions = ['Can I make this vegan?', 'What can I swap if I’m missing something?', 'How do I store leftovers?'];

export function Recipes() {
  const { cart, toast } = useWorkspace();
  const user = useAuthStore((state) => state.user);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recipesApi
      .list()
      .then((list) => {
        setRecipes(list);
        setSelected(list[0] ?? null);
      })
      .catch((err) => toast(formatApiError(err, 'Could not load your recipes.')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages, thinking]);

  function select(recipe: Recipe | null) {
    setSelected(recipe);
    setMessages([]);
    setInput('');
  }

  async function generate(regenerate: boolean) {
    setGenerating(true);
    try {
      const recipe = await recipesApi.generate(regenerate);
      // a cached recipe is already in the list, so drop the old copy first
      setRecipes((list) => [recipe, ...list.filter((r) => r.id !== recipe.id)]);
      select(recipe);
    } catch (err) {
      toast(formatApiError(err, 'Could not make a recipe right now.'));
    }
    setGenerating(false);
  }

  async function toggleFavorite(recipe: Recipe) {
    try {
      const updated = await recipesApi.setFavorite(recipe.id, !recipe.is_favorite);
      setRecipes((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (err) {
      toast(formatApiError(err, 'Could not update this recipe.'));
    }
  }

  async function remove(recipe: Recipe) {
    try {
      await recipesApi.remove(recipe.id);
      const rest = recipes.filter((r) => r.id !== recipe.id);
      setRecipes(rest);
      if (selected?.id === recipe.id) select(rest[0] ?? null);
    } catch (err) {
      toast(formatApiError(err, 'Could not delete this recipe.'));
    }
  }

  async function send(text: string) {
    if (!selected || !text.trim() || thinking) return;

    // the backend keeps no chat history, so we send the whole conversation each time
    const conversation: ChatMessage[] = [...messages, { role: 'user', text: text.trim() }];
    setMessages(conversation);
    setInput('');
    setThinking(true);
    try {
      const reply = await recipesApi.chat(selected.id, conversation.slice(-30));
      setMessages([...conversation, { role: 'assistant', text: reply }]);
    } catch (err) {
      toast(formatApiError(err, 'Could not get an answer, please try again.'));
    }
    setThinking(false);
  }

  return (
    <>
      <PageHeading
        title="What’s cooking?"
        description="Turn your cart into a recipe, then ask anything about it."
        action={
          <button className={s.secondary} onClick={() => generate(false)} disabled={generating || !cart.length}>
            <CookingPot size={18} />
            Make a recipe
          </button>
        }
      />

      <div className={s.chatLayout}>
        <section className={s.chatPanel}>
          <div className={s.conversation}>
            {loading && <p className={s.emptyNote}>Loading your recipes…</p>}

            {!loading && !selected && (
              <div className={s.chatWelcome}>
                <div className={s.welcomeSpark}>
                  <CookingPot size={38} weight="light" />
                </div>
                <h2>Let’s cook something.</h2>
                <p>
                  {cart.length
                    ? 'We’ll build a recipe from what’s in your cart.'
                    : 'Your cart is empty. Scan a few products first.'}
                </p>
                <div className={s.prompts}>
                  <button onClick={() => generate(false)} disabled={generating || !cart.length}>
                    <CookingPot size={18} />
                    <span>{generating ? 'Cooking up a recipe…' : 'Make a recipe from my cart'}</span>
                  </button>
                </div>
              </div>
            )}

            {selected && (
              <article className={s.recipe}>
                <div className={s.recipeHeader}>
                  <h2>{selected.title}</h2>
                  <button
                    className={s.iconButton}
                    aria-label={selected.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => toggleFavorite(selected)}
                  >
                    <Heart size={20} weight={selected.is_favorite ? 'fill' : 'regular'} />
                  </button>
                </div>
                {selected.description && <p>{selected.description}</p>}
                <p className={s.recipeMeta}>
                  Serves {selected.servings ?? '?'} · {selected.prep_minutes ?? 0} min prep ·{' '}
                  {selected.cook_minutes ?? 0} min cook
                </p>

                <h3>Ingredients</h3>
                <ul>
                  {selected.ingredients.map((ingredient) => (
                    <li key={ingredient.name}>
                      {ingredient.amount} {ingredient.name}
                      {ingredient.product_id && <span className={s.fromCart}> · from your cart</span>}
                    </li>
                  ))}
                </ul>

                <h3>Steps</h3>
                <ol>
                  {selected.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                <button className={s.secondary} onClick={() => generate(true)} disabled={generating}>
                  <ArrowsClockwise size={16} />
                  {generating ? 'Cooking up a recipe…' : 'Try a different recipe'}
                </button>
              </article>
            )}

            {selected && (
              <div className={s.messages} role="log" aria-label="Conversation about this recipe">
                {messages.length === 0 && (
                  <div className={s.prompts}>
                    {suggestions.map((text) => (
                      <button key={text} onClick={() => send(text)}>
                        <Sparkle size={18} />
                        <span>{text}</span>
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((message, i) => (
                  <div key={i} className={`${s.message} ${message.role === 'user' ? s.userMessage : ''}`}>
                    <span className={s.messageAvatar}>
                      {message.role === 'assistant' ? <Sparkle size={18} /> : user?.username.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{message.role === 'assistant' ? 'truePantry' : 'You'}</strong>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className={s.thinking} role="status">
                    <Sparkle size={17} />
                    Thinking…
                  </div>
                )}
                <div ref={bottom} />
              </div>
            )}
          </div>

          <form
            className={s.composer}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="chat-message" className={s.srOnly}>
              Ask about this recipe
            </label>
            <input
              id="chat-message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selected ? 'Ask anything about this recipe…' : 'Make a recipe first'}
              maxLength={1500}
              autoComplete="off"
              disabled={!selected}
            />
            <button aria-label="Send message" disabled={!selected || !input.trim() || thinking}>
              <ArrowUp size={20} />
            </button>
          </form>
          <p className={s.chatDisclaimer}>AI suggestions. Always check the product label.</p>
        </section>

        <aside className={s.chatContext}>
          <div className={s.contextHeading}>
            <CookingPot size={21} />
            <span>Your recipes</span>
          </div>
          {!loading && !recipes.length && <p>No recipes yet.</p>}
          <ul className={s.recipeList}>
            {recipes.map((recipe) => (
              <li key={recipe.id} className={recipe.id === selected?.id ? s.active : ''}>
                <button onClick={() => select(recipe)} disabled={thinking}>
                  {recipe.is_favorite && <Heart size={13} weight="fill" />}
                  <span>{recipe.title}</span>
                </button>
                <button className={s.iconButton} aria-label={`Delete ${recipe.title}`} onClick={() => remove(recipe)}>
                  <Trash size={15} />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
