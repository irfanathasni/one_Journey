const BookingStatusTimeline = ({ booking, role = "customer" }) => {
  const status = booking?.status || "pending";
  const paymentStatus = booking?.paymentStatus || "pending";
  const finalPaymentStatus =
    booking?.finalPaymentStatus || "not_requested";

  const steps = [
    {
      key: "requested",
      label: "Booking Requested",
      description: "Booking request has been sent",
      completed: true,
    },
    {
      key: "approved",
      label: "Vendor Approved",
      description:
        status === "rejected"
          ? "Booking request was rejected"
          : "Vendor accepted the booking",
      completed: status === "approved" || status === "completed",
      rejected: status === "rejected",
    },
    {
      key: "advance",
      label: "Advance Payment",
      description:
        paymentStatus === "paid"
          ? "Advance payment received"
          : "Waiting for advance payment",
      completed: paymentStatus === "paid",
    },
    {
      key: "event",
      label: "Event",
      description:
        status === "completed"
          ? "Event has been completed"
          : "Event is scheduled",
      completed: status === "completed",
    },
    {
      key: "final",
      label: "Final Payment",
      description:
        finalPaymentStatus === "paid"
          ? "Remaining payment received"
          : finalPaymentStatus === "requested"
          ? "Final payment requested"
          : "Final payment not requested yet",
      completed: finalPaymentStatus === "paid",
    },
  ];

  if (status === "rejected") {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Booking Status</div>

        <div style={styles.timeline}>
          <div style={styles.timelineItem}>
            <div style={{ ...styles.dot, ...styles.completedDot }}>
              ✓
            </div>

            <div style={styles.content}>
              <strong style={styles.stepTitle}>
                Booking Requested
              </strong>

              <p style={styles.description}>
                Booking request was submitted
              </p>
            </div>
          </div>

          <div style={styles.line}></div>

          <div style={styles.timelineItem}>
            <div style={{ ...styles.dot, ...styles.rejectedDot }}>
              ✕
            </div>

            <div style={styles.content}>
              <strong style={styles.stepTitle}>
                Booking Rejected
              </strong>

              <p style={styles.rejectedText}>
                Vendor rejected this booking request
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Booking Status</div>

      <div style={styles.timeline}>
        {steps.map((step, index) => {
          const isActive =
            !step.completed &&
            (
              (step.key === "approved" && status === "pending") ||
              (step.key === "advance" &&
                status === "approved" &&
                paymentStatus !== "paid") ||
              (step.key === "event" &&
                status === "approved" &&
                paymentStatus === "paid") ||
              (step.key === "final" &&
                status === "completed" &&
                finalPaymentStatus !== "paid")
            );

          return (
            <div key={step.key}>
              <div style={styles.timelineItem}>
                <div
                  style={{
                    ...styles.dot,
                    ...(step.completed
                      ? styles.completedDot
                      : isActive
                      ? styles.activeDot
                      : styles.pendingDot),
                  }}
                >
                  {step.completed ? "✓" : index + 1}
                </div>

                <div style={styles.content}>
                  <strong style={styles.stepTitle}>
                    {step.label}
                  </strong>

                  <p
                    style={{
                      ...styles.description,
                      ...(isActive
                        ? styles.activeDescription
                        : {}),
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  style={{
                    ...styles.line,
                    ...(step.completed
                      ? styles.completedLine
                      : {}),
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "14px",
    background: "#faf9f6",
    border: "1px solid #e8e4dc",
  },

  title: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "18px",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
  },

  timelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  dot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    flexShrink: 0,
  },

  completedDot: {
    background: "#3D5A50",
    color: "#fff",
  },

  activeDot: {
    background: "#B8935A",
    color: "#fff",
  },

  pendingDot: {
    background: "#e5e5e5",
    color: "#888",
  },

  rejectedDot: {
    background: "#c94c4c",
    color: "#fff",
  },

  content: {
    paddingBottom: "4px",
  },

  stepTitle: {
    display: "block",
    fontSize: "14px",
    marginBottom: "3px",
  },

  description: {
    margin: 0,
    fontSize: "13px",
    color: "#888",
  },

  activeDescription: {
    color: "#A66B00",
    fontWeight: "600",
  },

  rejectedText: {
    margin: 0,
    fontSize: "13px",
    color: "#c94c4c",
  },

  line: {
    width: "2px",
    height: "24px",
    background: "#e5e5e5",
    marginLeft: "15px",
  },

  completedLine: {
    background: "#3D5A50",
  },
};

export default BookingStatusTimeline;
