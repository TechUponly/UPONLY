#!/bin/bash
# ==============================================================================
# UPONLY AI OS - Automated Azure App Service / Container Apps Deployment Script
# ==============================================================================

set -e

# Configuration Variables
RESOURCE_GROUP="rg-uponly-production"
LOCATION="westus2"
ACR_NAME="acruponlyai"
APP_SERVICE_PLAN="asp-uponly-plan"
WEB_APP_NAME="uponly-ai-os"
IMAGE_TAG="latest"

echo "🚀 Initiating UPONLY AI OS Deployment to Microsoft Azure..."

AZ_BIN="/Users/shamrai/Desktop/UPONLY/.venv/bin/az"
if [ ! -f "$AZ_BIN" ]; then
    AZ_BIN="az"
fi

echo "🔍 Checking Azure Authentication using $AZ_BIN..."
$AZ_BIN account show &> /dev/null || $AZ_BIN login

# Step 2: Create Resource Group
echo "📦 Step 1/5: Creating Azure Resource Group ($RESOURCE_GROUP)..."
$AZ_BIN group create --name $RESOURCE_GROUP --location eastus || true

# Step 3: Create Azure Container Registry (ACR)
echo "🏗️ Step 2/5: Creating Azure Container Registry ($ACR_NAME)..."
$AZ_BIN acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true || true

# Step 4: Build and Push Docker Image to ACR
echo "🐳 Step 3/5: Building & Pushing Container Image to Azure Container Registry..."
$AZ_BIN acr build --registry $ACR_NAME --image uponly-ai-os:$IMAGE_TAG .

# Step 5: Create App Service Plan
echo "💻 Step 4/5: Creating App Service Plan ($APP_SERVICE_PLAN)..."
$AZ_BIN appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --is-linux --sku B1 || true

# Step 6: Deploy Web App for Containers
echo "🌐 Step 5/5: Launching Web App Container Service ($WEB_APP_NAME)..."
ACR_SERVER="${ACR_NAME}.azurecr.io"
ACR_PASSWORD=$($AZ_BIN acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

$AZ_BIN webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEB_APP_NAME \
  --deployment-container-image-name ${ACR_SERVER}/uponly-ai-os:${IMAGE_TAG}

$AZ_BIN webapp config container set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name ${ACR_SERVER}/uponly-ai-os:${IMAGE_TAG} \
  --docker-registry-server-url https://${ACR_SERVER} \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password $ACR_PASSWORD

$AZ_BIN webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP_NAME \
  --settings WEBSITES_PORT=8090 ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"

echo "=============================================================================="
echo "🎉 SUCCESS: UPONLY AI OS is Live on Microsoft Azure!"
echo "URL: https://${WEB_APP_NAME}.azurewebsites.net"
echo "=============================================================================="
