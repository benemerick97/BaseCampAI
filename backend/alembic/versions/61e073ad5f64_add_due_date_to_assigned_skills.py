"""Add due_date to assigned_skills

Revision ID: 61e073ad5f64
Revises: 62368fd78045
Create Date: 2025-07-17 03:34:14.963368
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '61e073ad5f64'
down_revision: Union[str, Sequence[str], None] = '62368fd78045'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('assigned_skills', sa.Column('due_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('assigned_skills', 'due_date')
