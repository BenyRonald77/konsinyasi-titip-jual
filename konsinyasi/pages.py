"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def dashboard():
    return render_template("dashboard.html")


@pages_bp.get("/penitip")
def penitip():
    return render_template("penitip.html")


@pages_bp.get("/produk")
def produk():
    return render_template("produk.html")


@pages_bp.get("/kasir")
def kasir():
    return render_template("kasir.html")


@pages_bp.get("/bagi-hasil")
def bagihasil():
    return render_template("bagihasil.html")


@pages_bp.get("/retur")
def retur():
    return render_template("retur.html")
