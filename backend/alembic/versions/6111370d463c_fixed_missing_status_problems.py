"""fixed missing status problems

Revision ID: 6111370d463c
Revises: 92095476832d
Create Date: 2025-07-17 03:50:58.258250

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6111370d463c'
down_revision: Union[str, Sequence[str], None] = '92095476832d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE assignmentstatus ADD VALUE IF NOT EXISTS 'overdue'")
    op.execute("ALTER TYPE assignmentstatus ADD VALUE IF NOT EXISTS 'expired'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
