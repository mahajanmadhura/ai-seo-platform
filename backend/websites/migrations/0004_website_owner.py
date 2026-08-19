from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('websites', '0003_alter_website_owner'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(
            code=migrations.RunPython.noop,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
