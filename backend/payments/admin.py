from django.contrib import admin
from .models import UserCredit, Payment, CreditTransaction

admin.site.register(UserCredit)
admin.site.register(Payment)
admin.site.register(CreditTransaction)