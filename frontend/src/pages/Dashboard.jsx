import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { API_URL } from "../config";
import Header from "../components/Header";
import "../styles/modern.css";
import "./Dashboard.css";

const fileTypeIcons = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📈",
  pptx: "📈",
  zip: "🗜️",
  rar: "🗜️",
  txt: "📄",
  mp4: "🎬",
  mov: "🎬",
  mkv: "🎬",
  mp3: "🎵",
  wav: "🎵",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
  gif: "🖼️",
  webp: "🖼️",
  csv: "📑",
};

const getFileExtension = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();
  return extension === filename.toLowerCase() ? "" : extension;
};

const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "Unknown size";
  const sizes = ["B", "KB", "MB", "GB"];
  let index = 0;
  let value = Number(bytes);

  while (value >= 1024 && index < sizes.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(1)} ${sizes[index]}`;
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeFileUrl = (filepath) => {
  return `${API_URL}/${filepath.replace(/\\/g, "/")}`;
};

function Dashboard() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/files/my-files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Choose a file first");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload successful");
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete ${file.filename}?`)) {
      return;
    }

    setDeletingId(file.id);
    setStatusMessage("");
    setStatusType("");

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/files/${file.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchFiles();
      setStatusMessage(`Deleted ${file.filename} successfully.`);
      setStatusType("success");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || "Could not delete file.";
      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-page">
      <Header title="Cloud Storage" onLogout={handleLogout} />

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <section
        className="upload-panel"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-field">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <span className="file-name">
            {selectedFile ? selectedFile.name : "Drop a file here or choose"}
          </span>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="button primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </section>

      <section className="file-grid">
        {loading ? (
          <div className="empty-state">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <h2>No files found</h2>
            <p>Upload a file to start managing your storage like a modern cloud app.</p>
          </div>
        ) : (
          files.map((file) => {
            const extension = getFileExtension(file.filename) || "file";
            const icon = fileTypeIcons[extension] || "📁";
            const fileUrl = normalizeFileUrl(file.filepath);

            const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(extension);

            return (
              <article key={file.id} className="file-card">
                <div className="file-card-header">
                  <div className="file-icon">
                    {isImage ? (
                      <img src={fileUrl} alt={file.filename} />
                    ) : (
                      icon
                    )}
                  </div>
                  <div className="file-details">
                    <p className="file-name">{file.filename}</p>
                    <p className="file-type">{extension.toUpperCase()} file</p>
                  </div>
                </div>

                <div className="file-meta">
                  <p>Uploaded: {formatDate(file.uploaded_at)}</p>
                  <p>Size: {formatSize(file.filesize)}</p>
                </div>

                <div className="file-actions">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="action-button secondary"
                  >
                    Open
                  </a>
                  <a
                    href={fileUrl}
                    download={file.filename}
                    className="action-button secondary"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    className="action-button danger"
                    onClick={() => handleDelete(file)}
                    disabled={deletingId === file.id}
                  >
                    {deletingId === file.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

export default Dashboard;