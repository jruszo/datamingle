import pytest

# Test with authentication (using mock_auth)
def test_auth_endpoint_with_mock_auth(client, mock_auth):
    """
    Tests the /test/auth endpoint with an authenticated user provided by mock_auth.
    """
    test_user = mock_auth  # mock_auth yields the created test_user

    response = client.get('/test/auth')

    assert response.status_code == 200
    json_data = response.get_json()

    assert json_data['authenticated'] is True
    assert json_data['message'] == 'JWT Authentication test successful'
    assert json_data['auth_source'] == "mock_g_fixture" # Patched from "mock_jwt"

    # Assert local_user data
    assert json_data['local_user'] is not None
    assert json_data['local_user']['id'] == test_user.id
    assert json_data['local_user']['email'] == test_user.email
    assert json_data['local_user']['workos_user_id'] == test_user.workos_user_id
    assert json_data['local_user']['first_name'] == test_user.first_name
    assert json_data['local_user']['last_name'] == test_user.last_name

    # Assert workos_user data (based on MagicMock in mock_auth)
    # mock_auth sets request.workos_user = mock_workos_user
    # and mock_workos_user has .id, .email, .first_name, .last_name etc.
    assert json_data['workos_user'] is not None
    assert json_data['workos_user']['id'] == test_user.workos_user_id # mock_auth sets this
    assert json_data['workos_user']['email'] == test_user.email
    assert json_data['workos_user']['first_name'] == test_user.first_name
    assert json_data['workos_user']['last_name'] == test_user.last_name
    # profile_picture_url might be None by default in User model if not set
    assert json_data['workos_user']['profile_picture_url'] == test_user.profile_picture_url


    # Assert JWT info (based on mock_auth)
    assert json_data['jwt_info'] is not None
    assert json_data['jwt_info']['user_id'] == test_user.workos_user_id
    assert json_data['jwt_info']['organization_id'] == 'test_org_id_456' # As set in mock_auth

# Test without authentication (relying on original with_auth)
def test_auth_endpoint_without_auth(client):
    """
    Tests the /test/auth endpoint without any authentication.
    This relies on the original 'with_auth' decorator to deny access.
    """
    response = client.get('/test/auth')

    assert response.status_code == 401 # Unauthorized
    json_data = response.get_json()

    assert json_data['authenticated'] is False
    assert 'error' in json_data
    assert json_data['error'] == 'Authentication required'
    assert 'No Bearer token provided' in json_data['message']
