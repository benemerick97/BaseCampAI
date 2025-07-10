"""Convert slides column to JSONB

Revision ID: 8ae72896e038
Revises: bbf675cd2565
Create Date: 2025-07-10 00:00:25.800038
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql  # ✅ Import PostgreSQL types

# revision identifiers, used by Alembic.
revision: str = '8ae72896e038'
down_revision: Union[str, Sequence[str], None] = 'bbf675cd2565'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'courses',
        'slides',
        existing_type=sa.TEXT(),
        type_=postgresql.JSONB(),
        postgresql_using='slides::jsonb',
        nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'courses',
        'slides',
        existing_type=postgresql.JSONB(),
        type_=sa.TEXT(),
        postgresql_using='slides::text',
        nullable=True
    )
