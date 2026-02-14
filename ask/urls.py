from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("yes/", views.yes, name="yes"),
    path("no/", views.no, name="no"),
    path("gift/", views.gift, name="gift"),
]
