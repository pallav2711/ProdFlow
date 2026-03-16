import { useState, useEffect } from 'react'
import api from '../api/config'

const ProductPlanning = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [features, setFeatures] = useState([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [showDeleteFeatureModal, setShowDeleteFeatureModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [showEditFeatureModal, setShowEditFeatureModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [featureToDelete, setFeatureToDelete] = useState(null)
  const [productToEdit, setProductToEdit] = useState(null)
  const [featureToEdit, setFeatureToEdit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Developer')
  const [inviteSpecialization, setInviteSpecialization] = useState('None')

  const [productForm, setProductForm] = useState({
    name: '',
    vision: '',
    description: ''
  })

  const [featureForm, setFeatureForm] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    businessValue: 5,
    estimatedEffort: 0
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatures = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/features`)
      setFeatures(res.data.features)
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }

  const fetchTeamMembers = async (productId) => {
    try {
      const res = await api.get(`/teams/product/${productId}`)
      setTeamMembers(res.data.members)
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/teams/invite`, {
        productId: selectedProduct._id,
        email: inviteEmail,
        role: inviteRole,
        specialization: inviteSpecialization
      })
      alert('Invitation sent successfully!')
      setInviteEmail('')
      setInviteRole('Developer')
      setInviteSpecialization('None')
      fetchTeamMembers(selectedProduct._id)
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending invitation')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      await api.delete(`/teams/${memberId}`)
      alert('Member removed successfully')
      fetchTeamMembers(selectedProduct._id)
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing member')
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', productForm)
      alert('Product created successfully!')
      setShowProductModal(false)
      setProductForm({ name: '', vision: '', description: '' })
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating product')
    }
  }

  const handleEditProduct = (product) => {
    setProductToEdit(product)
    setProductForm({
      name: product.name,
      vision: product.vision,
      description: product.description || ''
    })
    setShowEditProductModal(true)
  }

  const handleEditProductSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/products/${productToEdit._id}`, productForm)
      alert('Product updated successfully!')
      setShowEditProductModal(false)
      setProductToEdit(null)
      setProductForm({ name: '', vision: '', description: '' })
      fetchProducts()
      if (selectedProduct?._id === productToEdit._id) {
        const updatedProduct = await api.get(`/products/${productToEdit._id}`)
        setSelectedProduct(updatedProduct.data.product)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating product')
    }
  }

  const handleDeleteProductClick = (product) => {
    setProductToDelete(product)
    setShowDeleteProductModal(true)
  }

  const handleDeleteProductConfirm = async () => {
    try {
      await api.delete(`/products/${productToDelete._id}`)
      setShowDeleteProductModal(false)
      setProductToDelete(null)
      if (selectedProduct?._id === productToDelete._id) {
        setSelectedProduct(null)
        setFeatures([])
      }
      fetchProducts()
      alert('Product deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting product')
    }
  }

  const handleFeatureSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/products/${selectedProduct._id}/features`, featureForm)
      alert('Feature created successfully!')
      setShowFeatureModal(false)
      setFeatureForm({ name: '', description: '', priority: 'Medium', businessValue: 5, estimatedEffort: 0 })
      fetchFeatures(selectedProduct._id)
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating feature')
    }
  }

  const handleEditFeature = (feature) => {
    setFeatureToEdit(feature)
    setFeatureForm({
      name: feature.name,
      description: feature.description,
      priority: feature.priority,
      businessValue: feature.businessValue,
      estimatedEffort: feature.estimatedEffort
    })
    setShowEditFeatureModal(true)
  }

  const handleEditFeatureSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/products/features/${featureToEdit._id}`, featureForm)
      alert('Feature updated successfully!')
      setShowEditFeatureModal(false)
      setFeatureToEdit(null)
      setFeatureForm({ name: '', description: '', priority: 'Medium', businessValue: 5, estimatedEffort: 0 })
      fetchFeatures(selectedProduct._id)
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating feature')
    }
  }

  const handleDeleteFeatureClick = (feature) => {
    setFeatureToDelete(feature)
    setShowDeleteFeatureModal(true)
  }

  const handleDeleteFeatureConfirm = async () => {
    try {
      await api.delete(`/products/features/${featureToDelete._id}`)
      setShowDeleteFeatureModal(false)
      setFeatureToDelete(null)
      fetchFeatures(selectedProduct._id)
      alert('Feature deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting feature')
    }
  }

  const selectProduct = (product) => {
    setSelectedProduct(product)
    fetchFeatures(product._id)
    fetchTeamMembers(product._id)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Planning</h1>
        <button
          onClick={() => setShowProductModal(true)}
          className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          Create Product
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-600">No products yet</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`p-3 rounded border ${
                    selectedProduct?._id === product._id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div onClick={() => selectProduct(product)} className="cursor-pointer">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{product.vision}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditProduct(product)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProductClick(product)
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          {selectedProduct ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                  <p className="text-gray-600">{selectedProduct.vision}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Manage Team
                  </button>
                  <button
                    onClick={() => setShowFeatureModal(true)}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2">Feature</th>
                      <th className="text-left py-2">Priority</th>
                      <th className="text-left py-2">Value</th>
                      <th className="text-left py-2">Effort</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature) => (
                      <tr key={feature._id} className="border-b border-gray-100">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            feature.priority === 'High' ? 'bg-red-100 text-red-700' :
                            feature.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {feature.priority}
                          </span>
                        </td>
                        <td className="py-3">{feature.businessValue}/10</td>
                        <td className="py-3">{feature.estimatedEffort}h</td>
                        <td className="py-3">{feature.status}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditFeature(feature)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFeatureClick(feature)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {features.length === 0 && (
                  <p className="text-center text-gray-600 py-8">No features added yet</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600">Select a product to view features</p>
          )}
        </div>
      </div>

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Product</h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vision</label>
                <textarea
                  value={productForm.vision}
                  onChange={(e) => setProductForm({ ...productForm, vision: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vision</label>
                <textarea
                  value={productForm.vision}
                  onChange={(e) => setProductForm({ ...productForm, vision: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false)
                    setProductToEdit(null)
                    setProductForm({ name: '', vision: '', description: '' })
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {showDeleteProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">⚠️ Delete Product</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <span className="font-bold">{productToDelete?.name}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium mb-2">This action will permanently delete:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>The product and all its data</li>
                  <li>All features in the backlog</li>
                  <li>All team member associations</li>
                  <li>All sprints and tasks</li>
                </ul>
                <p className="text-sm text-red-800 font-bold mt-3">This cannot be undone!</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteProductConfirm}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
              >
                Delete Product
              </button>
              <button
                onClick={() => {
                  setShowDeleteProductModal(false)
                  setProductToDelete(null)
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Feature</h2>
            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Name</label>
                <input
                  type="text"
                  value={featureForm.name}
                  onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  required
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={featureForm.priority}
                  onChange={(e) => setFeatureForm({ ...featureForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Value (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={featureForm.businessValue}
                  onChange={(e) => setFeatureForm({ ...featureForm, businessValue: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Effort (hours)</label>
                <input
                  type="number"
                  min="0"
                  value={featureForm.estimatedEffort}
                  onChange={(e) => setFeatureForm({ ...featureForm, estimatedEffort: parseFloat(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800">
                  Add Feature
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeatureModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Feature Modal */}
      {showEditFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Feature</h2>
            <form onSubmit={handleEditFeatureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Name</label>
                <input
                  type="text"
                  value={featureForm.name}
                  onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  required
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={featureForm.priority}
                  onChange={(e) => setFeatureForm({ ...featureForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Value (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={featureForm.businessValue}
                  onChange={(e) => setFeatureForm({ ...featureForm, businessValue: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Effort (hours)</label>
                <input
                  type="number"
                  min="0"
                  value={featureForm.estimatedEffort}
                  onChange={(e) => setFeatureForm({ ...featureForm, estimatedEffort: parseFloat(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditFeatureModal(false)
                    setFeatureToEdit(null)
                    setFeatureForm({ name: '', description: '', priority: 'Medium', businessValue: 5, estimatedEffort: 0 })
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Feature Confirmation Modal */}
      {showDeleteFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">⚠️ Delete Feature</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <span className="font-bold">{featureToDelete?.name}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium mb-2">This action will permanently delete:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>The feature and all its data</li>
                  <li>Any tasks associated with this feature</li>
                </ul>
                <p className="text-sm text-red-800 font-bold mt-3">This cannot be undone!</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteFeatureConfirm}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
              >
                Delete Feature
              </button>
              <button
                onClick={() => {
                  setShowDeleteFeatureModal(false)
                  setFeatureToDelete(null)
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Team Management</h2>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Invite Member Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Invite Team Member</h3>
              <form onSubmit={handleInviteMember} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => {
                        setInviteRole(e.target.value)
                        // Reset specialization when role changes
                        if (e.target.value !== 'Developer') {
                          setInviteSpecialization('None')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Product Manager">Product Manager</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                </div>
                
                {/* Specialization - Only show for Developers */}
                {inviteRole === 'Developer' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Specialization <span className="text-xs text-gray-500">(What type of work will they do?)</span>
                    </label>
                    <select
                      value={inviteSpecialization}
                      onChange={(e) => setInviteSpecialization(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="None">No Specialization</option>
                      <option value="Frontend">🎨 Frontend Developer</option>
                      <option value="Backend">⚙️ Backend Developer</option>
                      <option value="Database">🗄️ Database Specialist</option>
                      <option value="UI/UX Design">✨ UI/UX Designer</option>
                      <option value="DevOps">🚀 DevOps Engineer</option>
                      <option value="Testing">🧪 QA/Testing</option>
                      <option value="Full Stack">💻 Full Stack Developer</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      This will be their default work type when assigned to tasks
                    </p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-medium"
                >
                  Send Invitation
                </button>
              </form>
            </div>

            {/* Team Members List */}
            <div>
              <h3 className="font-bold mb-3">Team Members ({teamMembers.length})</h3>
              {teamMembers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No team members yet</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{member.user?.name || member.email}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {member.status}
                          </span>
                          {member.role === 'Developer' && member.specialization && member.specialization !== 'None' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                              {member.specialization === 'Frontend' && '🎨 Frontend'}
                              {member.specialization === 'Backend' && '⚙️ Backend'}
                              {member.specialization === 'Database' && '🗄️ Database'}
                              {member.specialization === 'UI/UX Design' && '✨ UI/UX Design'}
                              {member.specialization === 'DevOps' && '🚀 DevOps'}
                              {member.specialization === 'Testing' && '🧪 Testing'}
                              {member.specialization === 'Full Stack' && '💻 Full Stack'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {member.status === 'active' && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPlanning
