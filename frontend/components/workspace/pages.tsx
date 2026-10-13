"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Leaf,
  Plus,
  Scan,
  ShoppingBag,
  Sparkle,
  Target,
  Trash,
  Wallet,
} from "@phosphor-icons/react";
import { money, products } from "./mock-data";
import { ProductArt, Quantity, useShop } from "./workspace";
import s from "./workspace.module.css";

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={s.pageHeading}>
      <div>
        {eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Dashboard() {
  const { scan, quantities, goal, profile, user } = useShop();
  const count = Object.values(quantities).reduce((a, b) => a + b, 0);
  const total = products.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] || 0),
    0,
  );
  const displayName = (user?.username || profile.name).split(" ")[0];
  return (
    <>
      <PageHeading
        title={`Good things in store, ${displayName}.`}
        description="A fresh start for your next grocery run."
        action={
          <button className={s.secondary} onClick={scan}>
            <Scan size={18} />
            Start shopping
          </button>
        }
      />
      <div className={s.dashboardGrid}>
        <section className={s.scanHero}>
          <div className={s.heroCopy}>
            <span className={s.pill}>
              <span />
              Your in-aisle companion
            </span>
            <h2>
              Good choices start
              <br />
              with a little clarity.
            </h2>
            <p>
              Ingredients, nutrition, and what fits you.
              <br />
              Just point. We’ll take it from here.
            </p>
            <button className={s.primary} onClick={scan}>
              <Scan size={19} />
              Scan a product
              <ArrowUpRight size={17} />
            </button>
            <small>No guesswork. Just a better-informed basket.</small>
          </div>
          <div className={s.heroArt}>
            <Image
              src="/images/carted-grocery-cart-transparent.png"
              alt="A playful shopping cart filled with fresh groceries"
              fill
              sizes="(max-width: 700px) 220px, 340px"
              priority
            />
            <span className={s.floatingTag}>
              <CheckCircle size={17} weight="fill" />A good fit for you
            </span>
          </div>
        </section>
        <section className={s.goalCard}>
          <span className={s.cardIcon}>
            <Target size={23} />
          </span>
          <span className={s.eyebrow}>A LITTLE INTENTION</span>
          <h2>
            Your cart.
            <br />
            Your kind of better.
          </h2>
          <p>
            You’re shopping with
            <br />
            <strong>{goal.toLowerCase()}</strong> in mind.
          </p>
          <Link href="/profile#preferences">
            Fine-tune your preferences <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <div className={s.stats}>
        <div>
          <span className={s.statIcon}>
            <Scan size={20} />
          </span>
          <span>
            <small>Products explored</small>
            <strong>
              12 <em>this week</em>
            </strong>
          </span>
          <span className={s.statDetail}>Curiosity looks good on you</span>
        </div>
        <div>
          <span className={s.statIcon}>
            <ShoppingBag size={20} />
          </span>
          <span>
            <small>In your basket</small>
            <strong>
              {count} <em>thoughtful picks</em>
            </strong>
          </span>
        </div>
        <div>
          <span className={s.statIcon}>
            <Wallet size={20} />
          </span>
          <span>
            <small>Estimated total</small>
            <strong>
              {money(total)} <em>USD</em>
            </strong>
          </span>
        </div>
      </div>
      <div className={s.sectionHeading}>
        <div>
          <h2>A few familiar favorites</h2>
          <p>Good picks from your recent explorations.</p>
        </div>
        <Link href="/cart">
          View my cart <ArrowRight size={17} />
        </Link>
      </div>
      <div className={s.productGrid}>
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} />
        ))}
      </div>
      <div className={s.bottomGrid}>
        <Link href="/chat" className={s.askCard}>
          <span className={s.cardIcon}>
            <Sparkle size={25} weight="light" />
          </span>
          <div>
            <span className={s.eyebrow}>A SECOND OPINION, ALWAYS HERE</span>
            <h2>
              “What can I make
              <br />
              with what’s in my cart?”
            </h2>
            <p>Big grocery questions. Friendly little answers.</p>
            <strong>
              Let’s talk about it <ArrowUpRight size={17} />
            </strong>
          </div>
        </Link>
      </div>
    </>
  );
}
function ProductCard({ id }: { id: string }) {
  const p = products.find((p) => p.id === id)!;
  const { change, toast } = useShop();
  return (
    <article className={s.productCard}>
      <ProductArt product={p} />
      <div className={s.productInfo}>
        <span className={s.productCategory}>
          {p.category}
          <span>{p.size}</span>
        </span>
        <h3>{p.name}</h3>
        <div className={s.productCardBottom}>
          <span>
            {money(p.price)}
            <small>Sample price</small>
          </span>
          <button
            className={s.addButton}
            aria-label={`Add ${p.name} to cart`}
            onClick={() => {
              change(p.id, 1);
              toast(`${p.name} added to your cart`);
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
export function Cart() {
  const { quantities, change, scan, toast } = useShop();
  const [copied, setCopied] = useState(false);
  const items = products.filter((p) => quantities[p.id] > 0);
  const count = items.reduce((sum, p) => sum + quantities[p.id], 0);
  const total = items.reduce((sum, p) => sum + quantities[p.id] * p.price, 0);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        items
          .map(
            (p) =>
              `${quantities[p.id]} × ${p.name} — ${money(p.price * quantities[p.id])}`,
          )
          .join("\n") + `\nEstimated total: ${money(total)}`,
      );
      setCopied(true);
      toast("Shopping list copied");
    } catch {
      toast("Could not copy. Please allow clipboard access and try again.");
    }
  }
  return (
    <div className={s.chatPage}>
      <PageHeading
        title="Your good little haul."
        description="Everything you’ve picked, all in one happy place."
        action={
          <button className={s.secondary} onClick={scan}>
            <Scan size={18} />
            Scan another
          </button>
        }
      />
      <div className={s.cartLayout}>
        <section className={s.cartPanel}>
          <div className={s.cartPanelHeading}>
            <h2>
              My shopping cart <span>{count} items</span>
            </h2>
            <span className={s.muted}>
              <Clock size={15} />
              Current trip
            </span>
          </div>
          {items.length ? (
            items.map((p) => (
              <article className={s.cartRow} key={p.id}>
                <ProductArt product={p} small />
                <div className={s.cartProduct}>
                  <small>{p.brand}</small>
                  <h3>{p.name}</h3>
                  <span>
                    {p.size} <span>·</span> {money(p.price)} each
                  </span>
                  <span className={s.productFit}>
                    <CheckCircle size={13} />
                    {p.category}
                  </span>
                </div>
                <Quantity id={p.id} value={quantities[p.id]} />
                <strong>{money(p.price * quantities[p.id])}</strong>
                <button
                  className={s.iconButton}
                  aria-label={`Remove ${p.name} from cart`}
                  onClick={() => {
                    change(p.id, -quantities[p.id]);
                    setCopied(false);
                  }}
                >
                  <Trash size={17} />
                </button>
              </article>
            ))
          ) : (
            <div className={s.empty}>
              <ShoppingBag size={44} weight="light" />
              <h2>Room for something good.</h2>
              <p>Your next lovely find belongs here.</p>
              <button className={s.primary} onClick={scan}>
                Scan your first product <Scan size={18} />
              </button>
            </div>
          )}
          <div className={s.cartFoot}>
            <Leaf size={17} />
            <span>A thoughtful basket starts one pick at a time.</span>
          </div>
        </section>
        <aside className={s.summary}>
          <span className={s.eyebrow}>THE LITTLE DETAILS</span>
          <h2>Your basket, at a glance.</h2>
          <div className={s.summaryLine}>
            <span>Products</span>
            <strong>{items.length} different picks</strong>
          </div>
          <div className={s.summaryLine}>
            <span>Total items</span>
            <strong>{count}</strong>
          </div>
          <div className={s.total}>
            <span>Estimated total</span>
            <strong>{money(total)}</strong>
          </div>
          <p>Sample prices in USD. Your in-store total may be different.</p>
          <button className={s.primary} disabled={!items.length} onClick={copy}>
            {copied ? "Copy shopping list again" : "Copy shopping list"}
            <ArrowUpRight size={17} />
          </button>
          <span className={s.summaryNote}>
            Your shopping list, ready to take along.
          </span>
          <Link href="/chat" className={s.summaryAsk}>
            <Sparkle size={23} />
            <span>
              <strong>A second look at your basket?</strong>
              <small>Find ideas with Ask Carted</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
      <div className={s.sectionHeading}>
        <div>
          <h2>A little inspiration for your basket</h2>
          <p>Everyday staples, with plenty of possibility.</p>
        </div>
        <span className={s.preview}>Sample selections</span>
      </div>
      <div className={s.productGrid}>
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} />
        ))}
      </div>
    </div>
  );
}
type Message = { role: "user" | "assistant"; text: string };
export function Chat() {
  const { quantities, goal, user, profile } = useShop();
  const userInitial = (user?.username || profile.name || "You").charAt(0).toUpperCase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const count = Object.values(quantities).reduce((a, b) => a + b, 0);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (messages.length)
      bottom.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [messages, thinking]);
  function send(text: string) {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { role: "user", text: text.trim() }]);
    setInput("");
    setThinking(true);
    const names = products
      .filter((p) => quantities[p.id] > 0)
      .map((p) => p.name.toLowerCase());
    timer.current = setTimeout(() => {
      let answer = `Let’s start with your goal: ${goal.toLowerCase()}. ${names.length ? `Your basket currently has ${names.join(", ")}. Pick a product and we can explore how it fits your next meal.` : "Your basket is empty. Add a sample product and we can explore it together."}`;
      if (/breakfast|make|meal|recipe/i.test(text))
        answer =
          quantities.oats && quantities.yogurt
            ? "A lovely start: overnight oats with a spoonful of Greek yogurt. You already have both in your basket. Stir the oats with milk or water, leave them in the fridge overnight, and add the yogurt in the morning. Fruit would make a nice finishing touch."
            : "For a simple breakfast idea, try oats with yogurt and fruit. Add the oats and yogurt from the sample products to build your basket around it.";
      else if (/protein/i.test(text))
        answer =
          "For this sample basket, Greek yogurt and chickpeas are easy starting points for a protein-focused meal. Try yogurt at breakfast or chickpeas tossed into a lunch bowl. Check the actual package for serving sizes, nutrition, and allergens.";
      else if (/budget|save|cost|less/i.test(text))
        answer =
          "A little basket check can go a long way: compare unit prices, choose a pack size you’ll finish, and plan more than one meal around each staple. Oats and chickpeas are versatile places to start. The prices here are samples, so compare the shelf labels in store.";
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      setThinking(false);
    }, 750);
  }
  return (
    <>
      <PageHeading
        title="A little help in every aisle."
        description="Talk groceries, find inspiration, and make room for better choices."
        action={
          <button
            className={s.secondary}
            onClick={() => {
              if (timer.current) clearTimeout(timer.current);
              setMessages([]);
              setThinking(false);
              setInput("");
            }}
          >
            <Plus size={18} />
            New conversation
          </button>
        }
      />
      <div className={s.chatLayout}>
        <section className={s.chatPanel}>
          <div className={s.chatBar}>
            <span className={s.companionIcon}>
              <Sparkle size={19} weight="fill" />
            </span>
            <span>
              <strong>Carted companion</strong>
              <small>A little context. A lot more clarity.</small>
            </span>
            <span className={s.demoBadge}>Demo</span>
          </div>
          <div className={s.conversation}>
            {!messages.length ? (
              <div className={s.chatWelcome}>
                <div className={s.welcomeSpark}>
                  <Sparkle size={38} weight="light" />
                </div>
                <span className={s.eyebrow}>
                  GROCERY QUESTIONS? YOU’RE IN GOOD COMPANY.
                </span>
                <h2>
                  Let’s make your next
                  <br />
                  pick a good one.
                </h2>
                <p>
                  From “what’s in this?” to “what’s for dinner?”
                  <br />
                  There’s no such thing as a small question.
                </p>
                <div className={s.prompts}>
                  {[
                    {
                      icon: ShoppingBag,
                      text: "What can I make with my cart?",
                    },
                    { icon: Target, text: "Help me find more protein" },
                    { icon: Wallet, text: "How can I shop for less?" },
                  ].map(({ icon: Icon, text }) => (
                    <button key={text} onClick={() => send(text)}>
                      <Icon size={18} />
                      <span>{text}</span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={s.messages} role="log" aria-label="Conversation">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${s.message} ${m.role === "user" ? s.userMessage : ""}`}
                  >
                    <span className={s.messageAvatar}>
                      {m.role === "assistant" ? <Sparkle size={18} /> : userInitial}
                    </span>
                    <div>
                      <strong>
                        {m.role === "assistant" ? "Carted" : "You"}
                      </strong>
                      <p>{m.text}</p>
                      {m.role === "assistant" && (
                        <small>Illustrative response · demo companion</small>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className={s.thinking} role="status">
                    <Sparkle size={17} />
                    Finding a little inspiration…
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
              Your message to Carted
            </label>
            <input
              id="chat-message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What’s on your grocery mind?"
              maxLength={1500}
              autoComplete="off"
            />
            <button
              aria-label="Send message"
              disabled={!input.trim() || thinking}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          <p className={s.chatDisclaimer}>
            A preview with sample replies. Always check the product label.
          </p>
        </section>
        <aside className={s.chatContext}>
          <div className={s.contextHeading}>
            <Leaf size={21} />
            <span>A little about you</span>
          </div>
          <p>Good advice starts with your kind of everyday.</p>
          <span className={s.eyebrow}>YOUR CURRENT GOAL</span>
          <div className={s.contextGoal}>
            <Target size={19} />
            {goal}
          </div>
          <div className={s.contextHeading}>
            <h3>Coming along for the chat</h3>
            <span className={s.count}>{count}</span>
          </div>
          <div className={s.contextProducts}>
            {products
              .filter((p) => quantities[p.id] > 0)
              .map((p) => (
                <div key={p.id}>
                  <ProductArt product={p} small />
                  <span>
                    <strong>{p.name}</strong>
                    <small>{quantities[p.id]} in your cart</small>
                  </span>
                </div>
              ))}
          </div>
          {!count && (
            <p>
              Your cart is empty. Add a few picks to give our conversation
              context.
            </p>
          )}
          <Link href="/cart" className={s.contextLink}>
            Take a look at my cart <ArrowRight size={16} />
          </Link>
          <div className={s.contextNote}>
            <Sparkle size={20} />
            <p>
              Your goals and basket make the conversation feel a little more
              you.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
