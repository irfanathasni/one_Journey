import { useEffect, useState } from "react";
import { Plus, Pencil, Power } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get(
        "/admin/categories"
      );

      setCategories(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setFormError("Category name is required");
      return;
    }

    try {
      setCreating(true);
      setFormError("");

      const res = await axiosInstance.post(
        "/admin/categories",
        {
          name: categoryName.trim(),
          description: description.trim(),
        }
      );

      if (res.data.success) {
        setShowModal(false);
        setCategoryName("");
        setDescription("");

        await fetchCategories();
      }
    } catch (error) {
      console.error(
        "Error creating category:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Failed to create category"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editName.trim()) {
      setEditError("Category name is required");
      return;
    }

    try {
      setUpdating(true);
      setEditError("");

      const res = await axiosInstance.put(
        `/admin/categories/${editingCategory._id}`,
        {
          name: editName.trim(),
          description: editDescription.trim(),
        }
      );

      if (res.data.success) {
        setShowEditModal(false);
        setEditingCategory(null);

        await fetchCategories();
      }
    } catch (error) {
      console.error(
        "Error updating category:",
        error
      );

      setEditError(
        error.response?.data?.message ||
          "Failed to update category"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/categories/${category._id}/toggle-status`
      );

      if (res.data.success) {
        await fetchCategories();
      }
    } catch (error) {
      console.error(
        "Error toggling category status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update category status"
      );
    }
  };

  return (
    <>
      <div
        className="category-page"
        style={styles.page}
      >
        {/* Header */}
        <div
          className="category-header"
          style={styles.header}
        >
          <div>
            <h1 style={styles.title}>
              Category Management
            </h1>

            <p style={styles.subtitle}>
              Manage wedding service categories
            </p>
          </div>

          <button
            className="category-add-button"
            style={styles.addButton}
            onClick={() => {
              setShowModal(true);
              setFormError("");
            }}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Categories Card */}
        <div style={styles.card}>
          <div
            className="category-card-header"
            style={styles.cardHeader}
          >
            <div>
              <h3 style={styles.cardTitle}>
                All Categories
              </h3>

              <p style={styles.cardSubtitle}>
                {categories.length} categories available
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={styles.centerMessage}>
              Loading categories...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            categories.length === 0 && (
              <div style={styles.centerMessage}>
                No categories found.
              </div>
            )}

          {/* Table */}
          {!loading &&
            !error &&
            categories.length > 0 && (
              <div
                className="category-table-wrapper"
                style={styles.tableWrapper}
              >
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        CATEGORY
                      </th>

                      <th style={styles.th}>
                        DESCRIPTION
                      </th>

                      <th style={styles.th}>
                        STATUS
                      </th>

                      <th
                        style={{
                          ...styles.th,
                          textAlign: "center",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category._id}
                        style={styles.row}
                      >
                        <td style={styles.td}>
                          <div
                            style={
                              styles.categoryName
                            }
                          >
                            {category.name}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={
                              styles.description
                            }
                          >
                            {category.description ||
                              "No description"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.status,
                              ...(category.isActive
                                ? styles.active
                                : styles.inactive),
                            }}
                          >
                            <span
                              style={{
                                ...styles.statusDot,
                                background:
                                  category.isActive
                                    ? "#4CAF50"
                                    : "#999",
                              }}
                            />

                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div
                            className="category-actions"
                            style={styles.actions}
                          >
                            <button
                              style={
                                styles.editButton
                              }
                              title="Edit Category"
                              onClick={() =>
                                handleEditClick(
                                  category
                                )
                              }
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              style={
                                category.isActive
                                  ? styles.deactivateButton
                                  : styles.activateButton
                              }
                              title="Toggle Status"
                              onClick={() =>
                                handleToggleStatus(
                                  category
                                )
                              }
                            >
                              <Power size={16} />

                              {category.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div
            className="category-modal"
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Add Category
                </h2>

                <p style={styles.modalSubtitle}>
                  Create a new wedding service category
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateCategory}
            >
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Catering"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Enter category description"
                  rows="4"
                  style={styles.textarea}
                />
              </div>

              {formError && (
                <div style={styles.formError}>
                  {formError}
                </div>
              )}

              <div
                className="modal-actions"
                style={styles.modalActions}
              >
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.createButton}
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div
            className="category-modal"
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Edit Category
                </h2>

                <p style={styles.modalSubtitle}>
                  Update category information
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateCategory}
            >
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  placeholder="Enter category name"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(
                      e.target.value
                    )
                  }
                  placeholder="Enter category description"
                  rows="4"
                  style={styles.textarea}
                />
              </div>

              {editError && (
                <div style={styles.formError}>
                  {editError}
                </div>
              )}

              <div
                className="modal-actions"
                style={styles.modalActions}
              >
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.createButton}
                  disabled={updating}
                >
                  {updating
                    ? "Updating..."
                    : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>
        {`
          .category-page {
            width: 100%;
          }

          .category-table-wrapper {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .category-table-wrapper table {
            min-width: 750px;
          }

          @media (max-width: 768px) {
            .category-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 18px;
            }

            .category-add-button {
              width: 100%;
              justify-content: center;
            }

            .category-card-header {
              padding: 18px !important;
            }

            .category-table-wrapper th,
            .category-table-wrapper td {
              padding: 14px 16px !important;
            }

            .category-actions {
              justify-content: flex-start !important;
            }

            .category-modal {
              width: calc(100% - 32px) !important;
              max-width: 460px;
              padding: 22px !important;
            }
          }

          @media (max-width: 480px) {
            .category-page {
              padding: 12px !important;
            }

            .category-header {
              margin-bottom: 18px !important;
            }

            .category-header h1 {
              font-size: 23px !important;
            }

            .category-card-header {
              padding: 16px !important;
            }

            .category-table-wrapper {
              border-radius: 0;
            }

            .category-modal {
              width: calc(100% - 24px) !important;
              padding: 18px !important;
              border-radius: 12px;
            }

            .category-modal h2 {
              font-size: 20px !important;
            }

            .modal-actions {
              flex-direction: column-reverse;
            }

            .modal-actions button {
              width: 100%;
            }
          }
        `}
      </style>
    </>
  );
};

const styles = {
  page: {
    padding: "32px",
    background: "#FAF8F4",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontFamily: "Georgia, serif",
    color: "#2B2B2B",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#8C8C8C",
    fontSize: "14px",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    background: "#B8935A",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(184, 147, 90, 0.2)",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "14px",
    boxShadow:
      "0 4px 18px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #EEE8DF",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#2B2B2B",
    fontWeight: "600",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#999",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "15px 24px",
    textAlign: "left",
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#999",
    background: "#FCFAF7",
    borderBottom: "1px solid #EEE8DF",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "18px 24px",
    borderBottom: "1px solid #F1ECE5",
    fontSize: "14px",
    color: "#444",
    whiteSpace: "nowrap",
  },

  row: {
    transition: "background 0.2s ease",
  },

  categoryName: {
    fontWeight: "600",
    color: "#2B2B2B",
    fontSize: "15px",
  },

  description: {
    color: "#777",
    fontSize: "14px",
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  active: {
    background: "#EEF8F0",
    color: "#3D8B4A",
  },

  inactive: {
    background: "#F3F3F3",
    color: "#777",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "1px solid #DCCFBF",
    borderRadius: "7px",
    background: "#FFFFFF",
    color: "#8B6B3E",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  activateButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#EEF8F0",
    color: "#3D8B4A",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  deactivateButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#FFF3F3",
    color: "#C0392B",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  centerMessage: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },

  error: {
    margin: "20px",
    padding: "14px",
    borderRadius: "8px",
    background: "#FFF3F3",
    color: "#C0392B",
    fontSize: "14px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "12px",
    boxSizing: "border-box",
  },

  modal: {
    width: "460px",
    maxWidth: "100%",
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "26px",
    boxShadow:
      "0 15px 40px rgba(0, 0, 0, 0.15)",
    boxSizing: "border-box",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "15px",
  },

  modalTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    color: "#2B2B2B",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#999",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    color: "#999",
    cursor: "pointer",
    lineHeight: 1,
    flexShrink: 0,
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
  },

  input: {
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #DDD5C9",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #DDD5C9",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  formError: {
    padding: "10px 12px",
    marginBottom: "16px",
    borderRadius: "7px",
    background: "#FFF3F3",
    color: "#C0392B",
    fontSize: "13px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "1px solid #DDD5C9",
    borderRadius: "8px",
    background: "#FFFFFF",
    color: "#555",
    cursor: "pointer",
    fontWeight: "600",
  },

  createButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#B8935A",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default CategoryManagement;