"use client";

// TODO: replace stub views with real components once merged in frontend-SafeTrust
// Sources:
//   frontend-SafeTrust/src/components/escrow/views/EscrowPaidView.tsx
//   frontend-SafeTrust/src/components/escrow/views/EscrowBlockedView.tsx
//   frontend-SafeTrust/src/components/escrow/views/EscrowReleasedView.tsx
//   frontend-SafeTrust/src/components/escrow/RealTimeEscrowStatus.tsx
//
// Status-to-view mapping (when wired):
//   funded      -> EscrowPaidView     (Payment batch)
//   active      -> EscrowBlockedView  (Deposit blocked)
//   completed   -> EscrowReleasedView (Deposit released)
//   default     -> EscrowPaidView
//
// Real-time: RealTimeEscrowStatus (Hasura subscription) drives automatic transitions

import { useQuery } from '@apollo/client';
import { Home } from 'lucide-react';

import { InvoiceHeader } from '@/components/escrow/InvoiceHeader';
import { ProcessStepper } from '@/components/escrow/ProcessStepper';
import { GET_ESCROW_BY_ENGAGEMENT_ID } from '@/graphql/queries/escrow-queries';
import { useState, type CSSProperties } from 'react';

type StubStatus = 'paid' | 'blocked' | 'released';

type ViewConfig = {
  label: StubStatus;
  step: 2 | 3 | 4;
  title: string;
};

type EscrowApartment = {
  id: string;
  name: string;
  image_urls?: string[] | null;
};

type EscrowDetail = {
  id: string;
  amount: number;
  status: string;
  apartment?: EscrowApartment | null;
};

type EscrowDetailData = {
  escrows: EscrowDetail[];
};

const styles = {
  page: {
    maxWidth: '72rem',
    margin: '0 auto',
    padding: '2rem 1.5rem 3rem',
    color: '#111827',
  } satisfies CSSProperties,
  grid: {
    display: 'grid',
    gap: '1.5rem',
    marginTop: '1.5rem',
    alignItems: 'start',
  } satisfies CSSProperties,
  panel: {
    border: '1px solid #fed7aa',
    borderRadius: '1rem',
    backgroundColor: '#ffffff',
    padding: '1.5rem',
  } satisfies CSSProperties,
  splitGrid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
  } satisfies CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  } satisfies CSSProperties,
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    font: 'inherit',
    resize: 'vertical',
    minHeight: '6rem',
  } satisfies CSSProperties,
  buttonRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  } satisfies CSSProperties,
  secondaryButton: {
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
    borderRadius: '0.75rem',
    padding: '0.6rem 1rem',
    fontWeight: 600,
  } satisfies CSSProperties,
  primaryButton: {
    border: '1px solid #22c55e',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    borderRadius: '0.75rem',
    padding: '0.6rem 1rem',
    fontWeight: 700,
  } satisfies CSSProperties,
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } satisfies CSSProperties,
  productThumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    border: '1px solid #fed7aa',
    flexShrink: 0,
  } satisfies CSSProperties,
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  } satisfies CSSProperties,
  productIconFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  } satisfies CSSProperties,
} as const;

function getStubView(status: string | undefined): ViewConfig {
  switch (status) {
    case 'blocked':
      return { label: 'blocked', step: 3, title: 'Payment batch - Escrow Status' };
    case 'released':
      return { label: 'released', step: 4, title: 'Deposit / Escrow Released' };
    case 'paid':
    default:
      return { label: 'paid', step: 2, title: 'Payment batch January 2025' };
  }
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{label}</p>
      <p style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function ProductCell({ apartment }: { apartment?: EscrowApartment | null }) {
  const [imageFailed, setImageFailed] = useState(false);
  const apartmentName = apartment?.name ?? 'La sabana apartment';
  const thumbnailUrl = apartment?.image_urls?.[0];
  const shouldShowImage = Boolean(thumbnailUrl) && !imageFailed;

  return (
    <div style={styles.productCell}>
      <div style={styles.productThumbnail}>
        {shouldShowImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={apartmentName}
            style={styles.productImage}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div style={styles.productIconFallback} aria-label="Apartment image unavailable">
            <Home size={18} aria-hidden="true" />
          </div>
        )}
      </div>
      <span>{apartmentName}</span>
    </div>
  );
}

function PaidStubView({ escrow }: { escrow?: EscrowDetail }) {
  const amount = escrow?.amount ?? 4000;
  const formattedAmount = `$${Number(amount).toLocaleString()}`;
  const formattedTotal = `$${Number(amount * 2).toLocaleString()}`;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={styles.splitGrid}>
        <InfoPair label="Billed to" value="John_s@gmail.com" />
        <InfoPair label="Invoice Number" value="INV4257-09-012" />
        <InfoPair label="Billing details" value="John Smith" />
        <InfoPair label="Currency" value="IDR - Dollar" />
      </div>

      <div style={{ border: '1px solid #fed7aa', borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={styles.table}>
          <thead style={{ backgroundColor: '#fff7ed' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.9rem' }}>PRODUCT</th>
              <th style={{ textAlign: 'right', padding: '0.9rem' }}>PRICE / MONTH</th>
              <th style={{ textAlign: 'right', padding: '0.9rem' }}>DEPOSIT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.9rem', borderTop: '1px solid #fed7aa' }}>
                <ProductCell apartment={escrow?.apartment} />
              </td>
              <td style={{ padding: '0.9rem', textAlign: 'right', borderTop: '1px solid #fed7aa' }}>
                {formattedAmount}
              </td>
              <td style={{ padding: '0.9rem', textAlign: 'right', borderTop: '1px solid #fed7aa' }}>
                {formattedAmount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '0.95rem' }}>
        <strong>Total: {formattedTotal}</strong>
      </div>
    </div>
  );
}

function BlockedStubView() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={styles.splitGrid}>
        <InfoPair label="Creation date" value="25 January 2025" />
        <InfoPair label="Amount blocked" value="$4,000" />
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
          borderTop: '1px solid #fed7aa',
          paddingTop: '1.5rem',
        }}
      >
        <div>
          <h3 style={{ marginTop: 0 }}>Tenant Information</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <InfoPair label="Tenant name" value="John Smith" />
            <InfoPair label="Wallet Address" value="MJE...XN32" />
            <InfoPair label="Email" value="John_s@gmail.com" />
          </div>
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>Owner Information</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <InfoPair label="Owner name" value="Alberto Casas" />
            <InfoPair label="Wallet Address" value="MJE...XN32" />
            <InfoPair label="Email" value="albertoCasas100@gmail.com" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReleasedStubView() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <h3 style={{ margin: 0 }}>Escrow Justification</h3>
          <button type="button" disabled style={{ ...styles.secondaryButton, opacity: 0.5 }}>
            PDF
          </button>
        </div>
        <textarea style={styles.input} placeholder="Justification..." />
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Beneficiary Information</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <InfoPair label="Name" value="John Smith" />
            <InfoPair label="Wallet" value="MJE...XN32" />
            <InfoPair label="Released date" value="20 January 2025" />
            <InfoPair label="Deposit" value="$4,000" />
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Claims</h3>
          <textarea style={{ ...styles.input, minHeight: '5rem' }} placeholder="Claims..." />
          <div style={styles.buttonRow}>
            <button type="button" style={styles.secondaryButton}>
              Clean
            </button>
            <button type="button" style={styles.primaryButton}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EscrowDetailPage({
  params,
  searchParams,
}: {
  params: { id: string; escrowId: string };
  searchParams: { status?: string };
}) {
  const view = getStubView(searchParams?.status);
  const { data } = useQuery<EscrowDetailData>(GET_ESCROW_BY_ENGAGEMENT_ID, {
    variables: { engagementId: params.escrowId },
  });
  const escrow = data?.escrows?.[0];

  return (
    <div style={styles.page}>
      <InvoiceHeader
        invoiceNumber="INV4257-09-012"
        status={view.label}
        paidAt={`${params.escrowId} · 25 Jan 2025`}
      />

      <div style={{ ...styles.grid, gridTemplateColumns: 'minmax(0, 2fr) minmax(18rem, 1fr)' }}>
        <div style={styles.panel}>
          <p
            style={{
              marginTop: 0,
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#9ca3af',
            }}
          >
            Hotel {params.id}
          </p>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>{view.title}</h2>

          {/* TODO: swap placeholder sections for real escrow views once frontend-SafeTrust is merged */}
          {view.label === 'paid' && <PaidStubView escrow={escrow} />}
          {view.label === 'blocked' && <BlockedStubView />}
          {view.label === 'released' && <ReleasedStubView />}
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={styles.panel}>
            <h3 style={{ marginTop: 0 }}>Notes</h3>
            <textarea style={styles.input} placeholder="Notes..." />
          </div>
          <ProcessStepper currentStep={view.step} />
        </div>
      </div>

      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
        Dev: append ?status=paid|blocked|released
      </p>
    </div>
  );
}
