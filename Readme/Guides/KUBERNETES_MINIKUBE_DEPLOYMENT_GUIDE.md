# Kubernetes Deployment Guide for Full Stack Application on Minikube

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Minikube Setup](#minikube-setup)
3. [Docker Image Preparation](#docker-image-preparation)
4. [Kubernetes Manifests](#kubernetes-manifests)
5. [Deployment Steps](#deployment-steps)
6. [Exposing to Internet](#exposing-to-internet)
7. [Accessing the Application](#accessing-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Cleanup](#cleanup)

## Prerequisites

### 1. Install Required Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install Helm (optional for some deployments)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Verify Installations
```bash
minikube version
kubectl version --client
docker --version
```

## Minikube Setup

### 1. Start Minikube with Sufficient Resources
```bash
minikube start --driver=docker --cpus=4 --memory=8g --disk-size=20g
```

### 2. Configure Minikube Docker Environment
```bash
eval $(minikube -p minikube docker-env)
```

### 3. Enable Required Addons
```bash
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
```

### 4. Verify Minikube Status
```bash
minikube status
kubectl get nodes
```

## Docker Image Preparation

### 1. Build Docker Images with Minikube Docker Daemon
```bash
# Navigate to project directory
cd /home/ubuntu/project

# Build images using Minikube's Docker daemon
eval $(minikube docker-env)

# Build website image
docker build -t businessform-website -f Public/website.dockerfile Public/

# Build API image
docker build -t businessform-api -f api.Dockerfile .

# Build database image
docker build -t businessform-db -f db.Dockerfile .
```

### 2. Verify Images are Available in Minikube
```bash
docker images | grep businessform
```

## Kubernetes Manifests

Create the following Kubernetes manifest files:

### 1. Database Deployment and Service (`database-deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: businessform-db
  labels:
    app: businessform
    tier: database
spec:
  replicas: 1
  selector:
    matchLabels:
      app: businessform
      tier: database
  template:
    metadata:
      labels:
        app: businessform
        tier: database
    spec:
      containers:
      - name: postgres
        image: businessform-db:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          value: "myuser"
        - name: POSTGRES_PASSWORD
          value: "mypassword"
        - name: POSTGRES_DB
          value: "businessform_db"
        - name: DB_HOST
          value: "localhost"
        - name: DB_USER
          value: "myuser"
        - name: DB_PASSWORD
          value: "mypassword"
        - name: DB_NAME
          value: "businessform_db"
        - name: DB_PORT
          value: "5432"
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pv-claim
---
apiVersion: v1
kind: Service
metadata:
  name: businessform-db
  labels:
    app: businessform
    tier: database
spec:
  ports:
  - port: 5432
    targetPort: 5432
  selector:
    app: businessform
    tier: database
```

### 2. API Deployment and Service (`api-deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: businessform-api
  labels:
    app: businessform
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: businessform
      tier: backend
  template:
    metadata:
      labels:
        app: businessform
        tier: backend
    spec:
      containers:
      - name: api
        image: businessform-api:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: "businessform-db"
        - name: DB_USER
          value: "myuser"
        - name: DB_PASSWORD
          value: "mypassword"
        - name: DB_NAME
          value: "businessform_db"
        - name: DB_PORT
          value: "5432"
        - name: PORT
          value: "3000"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: businessform-api
  labels:
    app: businessform
    tier: backend
spec:
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: businessform
    tier: backend
```

### 3. Website Deployment and Service (`website-deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: businessform-website
  labels:
    app: businessform
    tier: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: businessform
      tier: frontend
  template:
    metadata:
      labels:
        app: businessform
        tier: frontend
    spec:
      containers:
      - name: website
        image: businessform-website:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 2
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: businessform-website
  labels:
    app: businessform
    tier: frontend
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: businessform
    tier: frontend
```

### 4. Ingress Resource (`ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: businessform-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: businessform-website
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: businessform-api
            port:
              number: 3000
```

### 5. Persistent Volume Claim (`pvc.yaml`)
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pv-claim
  labels:
    app: businessform
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

## Deployment Steps

### 1. Apply Persistent Volume Claim
```bash
kubectl apply -f pvc.yaml
```

### 2. Deploy Database
```bash
kubectl apply -f database-deployment.yaml
```

### 3. Wait for Database to be Ready
```bash
kubectl wait --for=condition=ready pod -l app=businessform,tier=database --timeout=300s
```

### 4. Deploy API
```bash
kubectl apply -f api-deployment.yaml
```

### 5. Wait for API to be Ready
```bash
kubectl wait --for=condition=ready pod -l app=businessform,tier=backend --timeout=300s
```

### 6. Deploy Website
```bash
kubectl apply -f website-deployment.yaml
```

### 7. Wait for Website to be Ready
```bash
kubectl wait --for=condition=ready pod -l app=businessform,tier=frontend --timeout=300s
```

### 8. Deploy Ingress
```bash
kubectl apply -f ingress.yaml
```

## Exposing to Internet

### 1. Get Minikube IP
```bash
minikube ip
```

### 2. Enable Ingress Addon (if not already enabled)
```bash
minikube addons enable ingress
```

### 3. Configure DNS or Use Minikube Tunnel
```bash
# Option 1: Use Minikube tunnel for direct access
minikube tunnel

# Option 2: Add to /etc/hosts for local testing
echo "$(minikube ip) businessform.local" | sudo tee -a /etc/hosts
```

### 4. Access the Application
```bash
# Website will be available at:
http://businessform.local

# API will be available at:
http://businessform.local/api
```

## Accessing the Application

### 1. Check All Services
```bash
kubectl get all
```

### 2. Check Ingress
```bash
kubectl get ingress
```

### 3. Check Pods Status
```bash
kubectl get pods
```

### 4. View Logs (if needed)
```bash
kubectl logs -l app=businessform,tier=frontend
kubectl logs -l app=businessform,tier=backend
kubectl logs -l app=businessform,tier=database
```

## Troubleshooting

### 1. Check Pod Status
```bash
kubectl describe pod <pod-name>
```

### 2. Check Service Endpoints
```bash
kubectl get endpoints
```

### 3. Check Ingress Controller Logs
```bash
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### 4. Common Issues and Solutions

**Issue: Images not found**
- Ensure you ran `eval $(minikube docker-env)`
- Rebuild images with Minikube Docker daemon

**Issue: Database connection failed**
- Check database pod logs
- Verify environment variables in API deployment

**Issue: Ingress not working**
- Verify ingress addon is enabled
- Check ingress controller status

## Cleanup

### 1. Delete All Resources
```bash
kubectl delete -f ingress.yaml
kubectl delete -f website-deployment.yaml
kubectl delete -f api-deployment.yaml
kubectl delete -f database-deployment.yaml
kubectl delete -f pvc.yaml
```

### 2. Stop Minikube
```bash
minikube stop
```

### 3. Delete Minikube Cluster (optional)
```bash
minikube delete
```

## Advanced Configuration

### 1. Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: businessform-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: businessform-api
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Resource Limits
Add to deployment specs:
```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

### 3. ConfigMaps for Environment Variables
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: businessform-config
data:
  DB_HOST: "businessform-db"
  DB_PORT: "5432"
```

## Monitoring and Logging

### 1. Access Kubernetes Dashboard
```bash
minikube dashboard
```

### 2. View Resource Usage
```bash
kubectl top pods
kubectl top nodes
```

### 3. Set Up Prometheus and Grafana (Optional)
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack
```

This comprehensive guide provides everything you need to deploy your full stack application to Minikube and expose it to the internet. The deployment includes proper separation of concerns with frontend, backend, and database tiers, along with health checks, scaling capabilities, and monitoring options.
