import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post("/auth/register", json={
        "name": "Alice",
        "email": "alice@test.com",
        "password": "secret123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@test.com"
    assert data["user"]["name"] == "Alice"


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    await client.post("/auth/register", json={
        "name": "Bob", "email": "bob@test.com", "password": "secret123",
    })
    resp = await client.post("/auth/register", json={
        "name": "Bob2", "email": "bob@test.com", "password": "secret456",
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/auth/register", json={
        "name": "Carol", "email": "carol@test.com", "password": "pass1234",
    })
    resp = await client.post("/auth/login", json={
        "email": "carol@test.com", "password": "pass1234",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/auth/register", json={
        "name": "Dave", "email": "dave@test.com", "password": "correct",
    })
    resp = await client.post("/auth/login", json={
        "email": "dave@test.com", "password": "wrong",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me(auth_client: AsyncClient):
    resp = await auth_client.get("/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_returns_refresh_token(client: AsyncClient):
    resp = await client.post("/auth/register", json={
        "name": "Refresh", "email": "refresh@test.com", "password": "secret123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "name": "Eve", "email": "eve@test.com", "password": "secret123",
    })
    refresh_token = reg.json()["refresh_token"]
    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
