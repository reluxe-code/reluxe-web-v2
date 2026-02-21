// src/components/beta/MemberDrawerPortal.js
// Reads drawer + rebook + booking modal state from MemberContext and renders all portals.
// Mounted once in BetaLayout so any component can trigger them.
import { useMember } from '@/context/MemberContext'
import MemberDrawer from '@/components/beta/MemberDrawer'
import RebookModal from '@/components/beta/RebookModal'
import BookingFlowModal from '@/components/booking/BookingFlowModal'

export default function MemberDrawerPortal({ fonts }) {
  const { member, profile, isAuthenticated, drawerOpen, drawerTab, closeDrawer, rebookOpen, rebookData, closeRebookModal, refreshProfile, bookingModalOpen, bookingLocationKey, closeBookingModal } = useMember()

  return (
    <>
      {/* Auth-only: drawer + rebook */}
      {isAuthenticated && (
        <>
          <MemberDrawer
            isOpen={drawerOpen}
            onClose={closeDrawer}
            initialTab={drawerTab}
            fonts={fonts}
            member={member}
            profile={profile}
          />
          <RebookModal
            isOpen={rebookOpen}
            onClose={closeRebookModal}
            data={rebookData}
            fonts={fonts}
            onBooked={() => refreshProfile()}
          />
        </>
      )}
      {/* Auth + Anon: booking flow modal */}
      <BookingFlowModal
        isOpen={bookingModalOpen}
        onClose={closeBookingModal}
        locationKey={bookingLocationKey}
        fonts={fonts}
      />
    </>
  )
}
