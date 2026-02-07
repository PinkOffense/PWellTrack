import pytest
from httpx import AsyncClient


async def _create_pet(client: AsyncClient) -> int:
    resp = await client.post("/pets/", json={"name": "TestPet", "species": "dog"})
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_feeding_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    # Create
    resp = await auth_client.post(f"/pets/{pet_id}/feeding", json={
        "food_type": "dry kibble", "actual_amount_grams": 200,
    })
    assert resp.status_code == 201
    fid = resp.json()["id"]
    # List
    resp = await auth_client.get(f"/pets/{pet_id}/feeding")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    # Update
    resp = await auth_client.put(f"/feeding/{fid}", json={"food_type": "wet food"})
    assert resp.status_code == 200
    assert resp.json()["food_type"] == "wet food"
    # Delete
    resp = await auth_client.delete(f"/feeding/{fid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_water_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    resp = await auth_client.post(f"/pets/{pet_id}/water", json={"amount_ml": 350})
    assert resp.status_code == 201
    wid = resp.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/water")
    assert len(resp.json()) == 1
    resp = await auth_client.put(f"/water/{wid}", json={"amount_ml": 500})
    assert resp.json()["amount_ml"] == 500
    resp = await auth_client.delete(f"/water/{wid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_vaccine_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    resp = await auth_client.post(f"/pets/{pet_id}/vaccines", json={
        "name": "Rabies", "date_administered": "2025-06-15",
    })
    assert resp.status_code == 201
    vid = resp.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/vaccines")
    assert len(resp.json()) == 1
    resp = await auth_client.put(f"/vaccines/{vid}", json={"clinic": "PetCare"})
    assert resp.json()["clinic"] == "PetCare"
    resp = await auth_client.delete(f"/vaccines/{vid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_medication_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    resp = await auth_client.post(f"/pets/{pet_id}/medications", json={
        "name": "Antibiotics", "dosage": "1 pill", "frequency_per_day": 2,
        "start_date": "2025-01-01",
    })
    assert resp.status_code == 201
    mid = resp.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/medications")
    assert len(resp.json()) == 1
    resp = await auth_client.put(f"/medications/{mid}", json={"dosage": "2 pills"})
    assert resp.json()["dosage"] == "2 pills"
    resp = await auth_client.delete(f"/medications/{mid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_event_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    resp = await auth_client.post(f"/pets/{pet_id}/events", json={
        "type": "vet_visit", "title": "Annual Checkup",
        "datetime_start": "2025-12-01T10:00:00",
    })
    assert resp.status_code == 201
    eid = resp.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/events")
    assert len(resp.json()) == 1
    resp = await auth_client.put(f"/events/{eid}", json={"location": "PetCare Clinic"})
    assert resp.json()["location"] == "PetCare Clinic"
    resp = await auth_client.delete(f"/events/{eid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_symptom_crud(auth_client: AsyncClient):
    pet_id = await _create_pet(auth_client)
    resp = await auth_client.post(f"/pets/{pet_id}/symptoms", json={
        "type": "vomiting", "severity": "mild",
    })
    assert resp.status_code == 201
    sid = resp.json()["id"]
    resp = await auth_client.get(f"/pets/{pet_id}/symptoms")
    assert len(resp.json()) == 1
    resp = await auth_client.put(f"/symptoms/{sid}", json={"severity": "moderate"})
    assert resp.json()["severity"] == "moderate"
    resp = await auth_client.delete(f"/symptoms/{sid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_health(auth_client: AsyncClient):
    resp = await auth_client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
