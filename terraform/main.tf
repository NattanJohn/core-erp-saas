# Configuração do provedor (AWS)
provider "aws" {
  region = "us-east-1"
}

# 1. Criar o User Pool (Onde ficam os usuários)
resource "aws_cognito_user_pool" "erp_pool" {
  name = "erp-user-pool"

  # Login será feito por e-mail
  username_attributes = ["email"]
  
  # Atributo personalizado para o nosso Tenant
  schema {
    attribute_data_type = "String"
    name                = "tenantId"
    mutable             = true
  }

  password_policy {
    minimum_length = 8
  }
}

# 2. Criar o Client (A "chave" para o seu App conversar com o Cognito)
resource "aws_cognito_user_pool_client" "erp_client" {
  name         = "erp-app-client"
  user_pool_id = aws_cognito_user_pool.erp_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

# 3. Mostrar os IDs no final (Outputs)
output "user_pool_id" {
  value = aws_cognito_user_pool.erp_pool.id
}

output "client_id" {
  value = aws_cognito_user_pool_client.erp_client.id
}