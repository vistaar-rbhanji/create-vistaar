"""Password / token helper placeholders for {{PACKAGE_NAME}}."""


def hash_password(_password: str) -> str:
    raise NotImplementedError("hash_password not implemented")


def verify_password(_password: str, _hash: str) -> bool:
    raise NotImplementedError("verify_password not implemented")


def sign_token(_payload: dict) -> str:
    raise NotImplementedError("sign_token not implemented")


def verify_token(_token: str) -> dict:
    raise NotImplementedError("verify_token not implemented")
