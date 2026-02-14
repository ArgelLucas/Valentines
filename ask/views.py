from django.shortcuts import render

def home(request):
    return render(request, "ask/home.html")

def yes(request):
    return render(request, "ask/yes.html")

def no(request):
    return render(request, "ask/no.html")

def gift(request):
    return render(request, "ask/gift.html")
