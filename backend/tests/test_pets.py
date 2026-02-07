import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_pet(auth_client: AsyncClient):
    resp = await auth_client.post("/pets/", json={
        "name": "Rex",
        "species": "dog",
        "breed": "Labrador",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Rex"
    assert data["species"] == "dog"


@pytest.mark.asyncio
async def test_list_pets(auth_client: AsyncClient):
    await auth_client.post("/pets/", json={"name": "Luna", "species": "cat"})
    resp = await auth_client.get("/pets/")
    assert resp.status_code == 200
    pets = resp.json()
    assert len(pets) >= 1


@pytest.mark.asyncio
async def test_get_pet(auth_client: AsyncClient):
    create = await auth_client.post("/pets/", json={"name": "Max", "species": "dog"})
    pet_id = create.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Max"


@pytest.mark.asyncio
async def test_update_pet(auth_client: AsyncClient):
    create = await auth_client.post("/pets/", json={"name": "Buddy", "species": "dog"})
    pet_id = create.json()["id"]
    resp = await auth_client.put(f"/pets/{pet_id}", json={"name": "Buddy Jr", "species": "dog"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Buddy Jr"


@pytest.mark.asyncio
async def test_delete_pet(auth_client: AsyncClient):
    create = await auth_client.post("/pets/", json={"name": "Temp", "species": "cat"})
    pet_id = create.json()["id"]
    resp = await auth_client.delete(f"/pets/{pet_id}")
    assert resp.status_code == 204
    get_resp = await auth_client.get(f"/pets/{pet_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_pet_today(auth_client: AsyncClient):
    create = await auth_client.post("/pets/", json={"name": "Today", "species": "dog"})
    pet_id = create.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/today")
    assert resp.status_code == 200
    data = resp.json()
    assert "feeding" in data
    assert "water" in data


@pytest.mark.asyncio
async def test_unauthorized_pet_access(client: AsyncClient):
    resp = await client.get("/pets/")
    assert resp.status_code == 401
