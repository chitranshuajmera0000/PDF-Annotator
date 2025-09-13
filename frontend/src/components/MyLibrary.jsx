import React from 'react';
import { getPDFs, deletePDF } from '../api';
import { useEffect } from 'react';
import { use } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaEdit, FaFilePdf } from 'react-icons/fa';
import axios from 'axios'
import { getToken, removeToken } from '../utils/auth';



const MyLibrary = () => {
    const [file, setFile] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
    const [error, setError] = React.useState('');
    const [pdfList, setPdfList] = React.useState([]);
    const [renamingId, setRenamingId] = React.useState(null);
    const [renameValue, setRenameValue] = React.useState('');
    const [user, setUser] = React.useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPDFs = async () => {
            try {
                const res = await getPDFs();
                setPdfList(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching PDF list');
            }
        };
        fetchPDFs();
    }, [uploading]);

    // Fetch user info on mount
    React.useEffect(() => {
        async function fetchUser() {
            try {
                const { isAuthenticated } = await import('../utils/auth');
                const userInfo = await isAuthenticated();
                if (userInfo && typeof userInfo === 'object') {
                    setUser(userInfo);
                }
            } catch (e) {
                // ignore
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);



    const fileUploadHandler = async () => {
        if (!file) {
            setError('Please select a PDF file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('pdfFile', file);
        try {
            setUploading(true);
            const res = await axios.post('http://localhost:5000/api/pdfs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (res.status === 201) {
                setUploading(false);
                setFile(null);
                setError('File uploaded successfully!');
            }
        } catch (err) {
            setUploading(false);
            setError(err.response?.data?.message || 'Error uploading file');
        }
    }


    const handleRename = async () => {
        if (!renameValue) {
            setError('Please enter a new name for the PDF.');
            return;
        }
        try {
            const res = await axios.put(`http://localhost:5000/api/pdfs/${renamingId}`, {
                newName: renameValue
            }, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            if (res.status === 200) {
                setPdfList(pdfList.map(pdf => pdf.uuid === renamingId ? { ...pdf, originalName: renameValue } : pdf));
                setError('PDF renamed successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error renaming file');
        } finally {
            setDeletingId(null);
        }
    }

    // Logout handler
    const handleLogout = () => {
        removeToken();
        window.location.reload();
    };

    const handleDelete = async (uuid) => {
        if (!window.confirm('Are you sure you want to delete this PDF? This action cannot be undone.')) return;
        try {
            setDeletingId(uuid);
            const res = await deletePDF(uuid);
            if (res.status === 200) {
                setPdfList(pdfList.filter(pdf => pdf.uuid !== uuid));
                setError('PDF deleted successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting file');
        }
        finally {
            setDeletingId(null);
        }
    }

    // Custom delete handler to show confirm box
    const handleDeleteClick = (uuid) => {
        setConfirmDeleteId(uuid);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        setConfirmDeleteId(null);
        try {
            await deletePDF(confirmDeleteId);
            setPdfList(pdfList.filter(pdf => pdf.uuid !== confirmDeleteId));
            setError('PDF deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting file');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteId(null);
    };

    return (
        <div className='min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100'>
            {/* Header */}
            <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 shadow-md border-b border-blue-100 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-extrabold text-blue-700 tracking-tight drop-shadow">DeeRef PDF Library</span>
                </div>
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="font-semibold text-blue-700">{user.name || user.email}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 px-4 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </header>

            {/* Main content */}
            <main className="flex flex-col gap-4 items-center w-full flex-1 space-y-6 mt-4">
                <div className="flex flex-col items-center w-full">
                    <div className="bg-white/80 rounded-xl shadow-lg px-8 py-6 flex flex-col items-center w-full max-w-xl">
                        <input type='file' className='border border-gray-300 rounded-lg p-2 mr-4' onChange={(e) => { setFile(e.target.files[0]) }} />
                        <button className='bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 mb-6 p-2 mt-2' onClick={fileUploadHandler} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
                <div>
                    {error && (
                        <div className={`p-2 rounded text-center mb-2 ${error.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>{error}</div>
                    )}
                </div>
                <div className="w-full max-w-6xl">
                    <h2 className='text-3xl font-extrabold mb-8 text-blue-700 drop-shadow'>My PDF Library</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {pdfList.map((pdf) => (
                            <div key={pdf.uuid} className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col items-start transition-transform duration-150 hover:scale-[1.03] hover:shadow-2xl relative min-w-[320px] max-w-full w-full">
                                <div className="flex items-center gap-2 mb-2 w-full">
                                    <FaFilePdf className="text-red-500 text-3xl flex-shrink-0" />
                                    {renamingId === pdf.uuid ? (
                                        <form onSubmit={e => {
                                            e.preventDefault();
                                            // TODO: Implement rename API call
                                            setRenamingId(null);
                                        }} className="flex-1 flex gap-2">
                                            <input
                                                className="border rounded px-2 py-1 text-gray-700 flex-1 min-w-0"
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="submit" className="text-green-600 font-bold" onClick={handleRename}>Save</button>
                                            <button type="button" className="text-gray-500" onClick={() => setRenamingId(null)}>Cancel</button>
                                        </form>
                                    ) : (
                                        <span className="font-semibold text-lg text-gray-800 truncate w-full block" title={pdf.originalName}>{pdf.originalName}</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mb-4 w-full truncate">Uploaded: {pdf.uploadedAt ? new Date(pdf.uploadedAt).toLocaleString() : 'Unknown'}</div>
                                <div className="flex gap-3 mt-auto w-full">
                                    <button
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold flex-1 justify-center shadow-sm"
                                        onClick={() => navigate(`/viewer/${pdf.uuid}`)}
                                        title="View PDF"
                                    >
                                        <FaEye /> View
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-semibold flex-1 justify-center shadow-sm"
                                        onClick={() => {
                                            setRenamingId(pdf.uuid);
                                            setRenameValue(pdf.originalName);
                                        }}
                                        title="Rename PDF"
                                    >
                                        <FaEdit /> Rename
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold flex-1 justify-center shadow-sm"
                                        onClick={() => handleDeleteClick(pdf.uuid)}
                                        disabled={deletingId === pdf.uuid}
                                        title="Delete PDF"
                                    >
                                        <FaTrash /> {deletingId === pdf.uuid ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {/* Delete confirmation modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-xs w-full border border-red-200">
                        <div className="text-xl font-bold text-red-600 mb-2">Delete PDF?</div>
                        <div className="text-gray-700 mb-6 text-center">Are you sure you want to delete this PDF? This action cannot be undone.</div>
                        <div className="flex gap-4 w-full justify-center">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
                                onClick={handleConfirmDelete}
                                autoFocus
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLibrary;
