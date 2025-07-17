"""Add overdue and expired to assignment status enum

Revision ID: 92095476832d
Revises: 61e073ad5f64
Create Date: 2025-07-17 03:47:26.865953

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92095476832d'
down_revision: Union[str, Sequence[str], None] = '61e073ad5f64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
