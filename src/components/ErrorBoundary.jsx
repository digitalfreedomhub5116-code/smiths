import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Smiths Jewellery UI Exception:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0B] text-cream flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full rounded-2xl border border-gold/30 bg-[#1A1A1A] p-8 shadow-2xl shadow-black space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-bold text-xl">
              !
            </div>
            <h2 className="font-heading text-lg font-bold text-cream">Notice</h2>
            <p className="text-xs text-cream-muted/70 leading-relaxed">
              A temporary issue occurred while loading this view. Click below to continue.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] text-rose-400 font-mono text-left break-words">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="btn-gold w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/25 cursor-pointer mt-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
