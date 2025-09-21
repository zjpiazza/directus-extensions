# 1. Create a gzipped tar archive of the extensions' *contents*
tar -czvf extensions.tar.gz -C extensions . && \
\
# 2. Copy the single archive file to a temp directory in the pod
kubectl cp extensions.tar.gz -n shared directus-5ffb495f84-5dfx7:/tmp/extensions.tar.gz && \
\
# 3. Exec into the pod to extract the archive and then remove it
kubectl exec -n shared directus-5ffb495f84-5dfx7 -- \
  sh -c "tar -xzvf /tmp/extensions.tar.gz -C /directus/extensions/ && rm /tmp/extensions.tar.gz" && \
\
# 4. Clean up the local archive file
rm extensions.tar.gz
