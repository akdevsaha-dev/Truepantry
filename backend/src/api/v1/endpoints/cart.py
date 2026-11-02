from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
from src.services.catalog import db_error, get_cart, get_cart_items, now
from src.validation.cart import QuantityRequest

router = APIRouter(prefix="/cart", tags=["Cart"])
supabase = get_supabase_client()


@router.get("")
def list_cart(current_user: dict = Depends(get_current_user)):
    """Everything the user has scanned, oldest first, with the product joined in."""
    cart = get_cart(current_user["id"])
    return get_cart_items(cart["id"]) if cart else []


@router.patch("/items/{item_id}")
def set_quantity(
    item_id: UUID,
    body: QuantityRequest,
    current_user: dict = Depends(get_current_user),
):
    cart = get_cart(current_user["id"])
    if not cart:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        res = (
            supabase.table("cart_items")
            .update({"quantity": body.quantity, "updated_at": now()})
            .eq("id", str(item_id))
            .eq("cart_id", cart["id"])
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": res.data[0]["id"], "quantity": res.data[0]["quantity"]}


@router.delete("/items/{item_id}", status_code=204)
def remove_item(item_id: UUID, current_user: dict = Depends(get_current_user)):
    cart = get_cart(current_user["id"])
    if not cart:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        res = (
            supabase.table("cart_items")
            .delete()
            .eq("id", str(item_id))
            .eq("cart_id", cart["id"])
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
