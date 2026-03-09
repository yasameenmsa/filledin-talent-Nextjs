import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DropdownMenu } from '@/components/ui/dropdown-menu'

describe('DropdownMenu Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should not render children when closed', () => {
    render(
      <DropdownMenu isOpen={false} className="test-class">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    expect(screen.queryByText('Dropdown Content')).not.toBeInTheDocument()
  })

  it('should render children when open', () => {
    render(
      <DropdownMenu isOpen={true} className="test-class">
        <div>Dropdown Content</div>
      </DropdownMenu>
    )
    expect(screen.getByText('Dropdown Content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <DropdownMenu isOpen={true} className="custom-class">
        <div>Content</div>
      </DropdownMenu>
    )
    const content = screen.getByText('Content').parentElement
    expect(content).toHaveClass('custom-class')
  })

  it('should animate in when opened', () => {
    render(
      <DropdownMenu isOpen={true} animation="slide">
        <div>Content</div>
      </DropdownMenu>
    )

    const container = screen.getByText('Content').parentElement

    // Initially should have opacity 0
    expect(container).toHaveStyle({ opacity: '0' })

    // After animation completes
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Check that opacity becomes 1 (the animation runs)
    act(() => {
      jest.runAllTimers()
    })
  })

  it('should animate out when closed', () => {
    const { rerender } = render(
      <DropdownMenu isOpen={true} animation="fade">
        <div>Content</div>
      </DropdownMenu>
    )

    rerender(
      <DropdownMenu isOpen={false} animation="fade">
        <div>Content</div>
      </DropdownMenu>
    )

    // Content should be removed after animation
    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })
})

import { act } from 'react'
