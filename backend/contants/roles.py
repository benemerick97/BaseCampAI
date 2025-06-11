# roles.py
from enum import Enum

class Role(str, Enum):
    super_admin = "super_admin"
    admin = "admin"
    user = "user"
