# AI Recommender Polling Optimization

## Problem Identified

The AI recommender was taking a very long time to load because of an inefficient polling mechanism:

1. **Long HTTP Timeouts**: Each polling request had a 90-second timeout. If the API was slow or not responding, each attempt would wait up to 90 seconds before timing out.

2. **Too Many Attempts**: With 90 attempts and 90-second timeouts, the total wait time could be hours.

3. **Short Wait Times**: The code only waited 1-2 seconds between attempts, but if each HTTP request timed out after 90 seconds, this created a very long total wait time.

4. **No Total Time Limit**: The code only checked attempt count, not total elapsed time.

## Solution Implemented

### Optimized Polling Mechanism

**Changes made to `app/Http/Controllers/WardrobeController.php`:**

1. **Shorter HTTP Timeout for Polling**: Changed from 90 seconds to 15 seconds
   - Polling requests are just checking status, not waiting for full responses
   - Faster failure detection if the API is not responding

2. **Progressive Wait Times**: Increased wait times between attempts
   - First 5 attempts: 2 seconds
   - Next 15 attempts: 3 seconds  
   - Remaining attempts: 5 seconds
   - This reduces unnecessary API calls while still checking frequently enough

3. **Total Time Limit**: Added a 5-minute (300 seconds) maximum total time
   - Prevents infinite polling
   - Ensures the request completes within a reasonable timeframe

4. **Reduced Max Attempts**: Changed from 90 to 60 attempts
   - With progressive wait times, 60 attempts = ~5 minutes total
   - More efficient than 90 attempts with 90-second timeouts

### Before vs After

**Before:**
- 90 attempts × 90-second timeout = up to 8,100 seconds (2.25 hours) worst case
- 1-2 second wait between attempts
- No total time limit

**After:**
- 60 attempts with 15-second timeout = up to 900 seconds (15 minutes) worst case per attempt
- Progressive wait times: 2s → 3s → 5s
- 5-minute (300 seconds) total time limit
- **Expected total time: ~5 minutes maximum**

## Expected Performance

- **Fast responses**: If the API responds quickly, results are returned immediately
- **Slow responses**: Maximum 5 minutes total wait time
- **Failed requests**: Failures are detected within 15 seconds instead of 90 seconds
- **Better user experience**: Users see results faster or get timeout errors sooner

## Testing Recommendations

1. Test with a small wardrobe (2-5 items) - should respond quickly
2. Test with a large wardrobe (20+ items) - should complete within 5 minutes
3. Test with slow/unresponsive API - should timeout gracefully after 5 minutes
4. Monitor logs to verify polling is working efficiently

## Additional Notes

- The POST request to initiate the prediction still uses a 90-second timeout (this is correct, as it's the initial request)
- The Nginx timeout (300 seconds) is still sufficient for the 5-minute polling window
- PHP execution time limit is still set to unlimited to allow the full polling cycle

