"""Fix circular dependency between DocumentObject and DocumentFile

Revision ID: 2772e27edb24
Revises: 7c97641b3d77
Create Date: 2025-06-30 08:07:22.144449

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2772e27edb24'
down_revision: Union[str, Sequence[str], None] = '7c97641b3d77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop and recreate organisation FK with ondelete
    op.drop_constraint(op.f('document_objects_org_id_fkey'), 'document_objects', type_='foreignkey')
    op.create_foreign_key(
        op.f('document_objects_org_id_fkey'),
        'document_objects', 'organisations',
        ['org_id'], ['id'],
        ondelete='CASCADE'
    )

    # Add deferred FK to resolve circular dependency
    op.create_foreign_key(
        'fk_current_file_id',
        'document_objects', 'document_files',
        ['current_file_id'], ['id'],
        use_alter=True
    )

    # Drop and recreate FK on document_files with ondelete
    op.drop_constraint(op.f('document_files_document_id_fkey'), 'document_files', type_='foreignkey')
    op.create_foreign_key(
        op.f('document_files_document_id_fkey'),
        'document_files', 'document_objects',
        ['document_id'], ['id'],
        ondelete='CASCADE'
    )



def downgrade() -> None:
    op.drop_constraint('fk_current_file_id', 'document_objects', type_='foreignkey')

    op.drop_constraint(op.f('document_objects_org_id_fkey'), 'document_objects', type_='foreignkey')
    op.create_foreign_key(
        op.f('document_objects_org_id_fkey'),
        'document_objects', 'organisations',
        ['org_id'], ['id']
    )

    op.drop_constraint(op.f('document_files_document_id_fkey'), 'document_files', type_='foreignkey')
    op.create_foreign_key(
        op.f('document_files_document_id_fkey'),
        'document_files', 'document_objects',
        ['document_id'], ['id']
    )
