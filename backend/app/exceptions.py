from fastapi import HTTPException, status

def raise_404_exception(detail: str = "Item not found") -> None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

def raise_400_exception(detail: str = "Bad Request") -> None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

def raise_401_exception(detail: str = "Unauthorized") -> None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

def raise_403_exception(detail: str = "Forbidden") -> None:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

def raise_422_exception(detail: str = "Unprocessable Entity") -> None:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

def raise_500_exception(detail: str = "Internal Server Error") -> None:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

def raise_409_exception(detail: str = "Conflict") -> None:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

def raise_exception(status_code: int, detail: str) -> None:
    raise HTTPException(status_code=status_code, detail=detail)

