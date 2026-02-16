// public/blvd-widget.js
;(function () {
  window.openProviderBooking = function ({ locationId, staffId, serviceId }) {
    const params = new URLSearchParams({
      locationId,
      staffId,
      visitType: 'SELF_VISIT'
    })
    if (serviceId) params.set('serviceId', serviceId)

    if (window.blvd?.openBookingWidget) {
      window.blvd.openBookingWidget({ urlParams: Object.fromEntries(params) })
    } else {
      // Fallback: replace with your hosted booking URL
      const base = 'https://book.joinblvd.com/your-business-slug'
      window.location.href = `${base}?${params.toString()}`
    }
  }
})();
