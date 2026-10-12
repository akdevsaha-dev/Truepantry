from pwdlib import PasswordHash


def get_hashed_password(password: str) -> str:
    hashedPassword = PasswordHash.recommended().hash(password)
    return hashedPassword


def check_password_valid(password: str, hashed_password: str) -> bool:
    is_valid = PasswordHash.recommended().verify(password, hashed_password)
    return is_valid
