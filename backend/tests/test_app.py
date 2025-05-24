import pytest

def test_health_check(client):
    """
    Tests the /health endpoint.
    """
    response = client.get('/health')

    assert response.status_code == 200
    json_data = response.get_json()

    assert json_data['status'] == 'healthy'
    assert json_data['service'] == 'WorkOS Flask Backend'
    
    # Check for the presence and type of boolean fields
    assert 'workos_configured' in json_data
    assert isinstance(json_data['workos_configured'], bool)
    
    assert json_data['cors_enabled'] is True # As per app.py, this is hardcoded
    
    assert 'database_configured' in json_data
    assert isinstance(json_data['database_configured'], bool)

def test_hello_world_root(client):
    """
    Tests the root ("/") endpoint.
    """
    response = client.get('/')

    assert response.status_code == 200
    assert response.data.decode('utf-8') == "<p>Hello, World! WorkOS Flask Backend is running.</p>"
