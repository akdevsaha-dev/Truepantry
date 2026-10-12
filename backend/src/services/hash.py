from pwdlib import PasswordHash


def get_hashed_password(password: str) -> str:
    hashedPassword = PasswordHash.recommended().hash(password)
    return hashedPassword


# for verification
# is_valid = password_hash.verify(entered_password, hashed_password)
