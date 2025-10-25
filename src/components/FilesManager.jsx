function FilesManager({ 
  uploadedFiles, 
  isDragging, 
  businessInfo,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onInputChange,
  onSubmit 
}) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
        Manage Your <span style={{ color: '#75FDA8' }}>Files</span>
      </h2>
      
      {/* File Upload Area */}
      <div className="mb-8">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="relative p-12 rounded-xl text-center transition-all duration-300"
          style={{
            backgroundColor: isDragging ? '#27705D' : '#2D2D2D',
            border: `2px dashed ${isDragging ? '#75FDA8' : '#27705D'}`
          }}
        >
          <input
            type="file"
            multiple
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
            {isDragging ? 'Drop files here!' : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm" style={{ color: '#E5E7EB' }}>
            Upload PDFs, documents, images, or any business files
          </p>
        </div>
      </div>
      
      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mb-8 rounded-xl shadow-md p-6" style={{ backgroundColor: '#2D2D2D' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#1F1F1F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27705D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {file.type.includes('pdf') ? '📄' : 
                     file.type.includes('image') ? '🖼️' : '📎'}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#FFFFFF' }}>{file.name}</p>
                    <p className="text-sm" style={{ color: '#E5E7EB' }}>
                      {file.size} • {file.uploadedAt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(idx)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#CC0000'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B6B'}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Business Information Form */}
      <div className="rounded-xl shadow-md p-6" style={{ backgroundColor: '#2D2D2D' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          Business Information
        </h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={businessInfo.companyName}
              onChange={onInputChange}
              className="w-full px-4 py-2 rounded-lg transition-all duration-200"
              style={{ 
                outline: 'none',
                backgroundColor: '#1F1F1F',
                border: '1px solid #27705D',
                color: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
              onBlur={(e) => e.target.style.borderColor = '#27705D'}
              placeholder="Your company name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Services Offered
            </label>
            <textarea
              name="services"
              value={businessInfo.services}
              onChange={onInputChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg transition-all duration-200"
              style={{ 
                outline: 'none',
                backgroundColor: '#1F1F1F',
                border: '1px solid #27705D',
                color: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
              onBlur={(e) => e.target.style.borderColor = '#27705D'}
              placeholder="Describe your services..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Common FAQs
            </label>
            <textarea
              name="faqs"
              value={businessInfo.faqs}
              onChange={onInputChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg transition-all duration-200"
              style={{ 
                outline: 'none',
                backgroundColor: '#1F1F1F',
                border: '1px solid #27705D',
                color: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
              onBlur={(e) => e.target.style.borderColor = '#27705D'}
              placeholder="List frequently asked questions..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Business Description
            </label>
            <textarea
              name="description"
              value={businessInfo.description}
              onChange={onInputChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg transition-all duration-200"
              style={{ 
                outline: 'none',
                backgroundColor: '#1F1F1F',
                border: '1px solid #27705D',
                color: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#75FDA8'}
              onBlur={(e) => e.target.style.borderColor = '#27705D'}
              placeholder="Tell us about your business..."
            />
          </div>
          
          <button
            type="button"
            onClick={onSubmit}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#27705D'
              e.target.style.color = '#FFFFFF'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#75FDA8'
              e.target.style.color = '#2D2D2D'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Save & Train AI
          </button>
        </form>
      </div>
    </div>
  )
}

export default FilesManager
