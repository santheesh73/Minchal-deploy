import hashlib
import logging

logger = logging.getLogger(__name__)

# In-memory caches for bills and nameplates
# Structure: { sha256_hex: parsed_dict }
_bill_cache = {}
_nameplate_cache = {}

def get_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

def get_cached_bill(image_bytes: bytes):
    img_hash = get_hash(image_bytes)
    if img_hash in _bill_cache:
        logger.info(f"CACHE HIT: Bill extraction cache found for hash {img_hash[:8]}...")
        return _bill_cache[img_hash]
    logger.info(f"CACHE MISS: No cached bill found for hash {img_hash[:8]}...")
    return None

def set_cached_bill(image_bytes: bytes, data: dict):
    img_hash = get_hash(image_bytes)
    _bill_cache[img_hash] = data
    logger.info(f"CACHE SET: Cached bill response for hash {img_hash[:8]}...")

def get_cached_nameplate(image_bytes: bytes):
    img_hash = get_hash(image_bytes)
    if img_hash in _nameplate_cache:
        logger.info(f"CACHE HIT: Nameplate extraction cache found for hash {img_hash[:8]}...")
        return _nameplate_cache[img_hash]
    logger.info(f"CACHE MISS: No cached nameplate found for hash {img_hash[:8]}...")
    return None

def set_cached_nameplate(image_bytes: bytes, data: dict):
    img_hash = get_hash(image_bytes)
    _nameplate_cache[img_hash] = data
    logger.info(f"CACHE SET: Cached nameplate response for hash {img_hash[:8]}...")

def clear_caches():
    global _bill_cache, _nameplate_cache
    _bill_cache.clear()
    _nameplate_cache.clear()
    logger.info("CACHES CLEARED: All image caches cleared.")
