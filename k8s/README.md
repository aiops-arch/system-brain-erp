# Local Kubernetes

This folder runs System Brain ERP on a free local Kubernetes cluster using Docker and kind.

```powershell
kind create cluster --config k8s/kind-config.yaml
docker build -t system-brain-erp:local .
kind load docker-image system-brain-erp:local --name system-brain-erp
kubectl apply -k k8s
kubectl -n system-brain-erp rollout status deployment/system-brain-erp
```

Open:

```text
http://localhost:8080
```

Useful commands:

```powershell
kubectl -n system-brain-erp get pods,svc
kubectl -n system-brain-erp logs deployment/system-brain-erp
kubectl -n system-brain-erp rollout restart deployment/system-brain-erp
kind delete cluster --name system-brain-erp
```
