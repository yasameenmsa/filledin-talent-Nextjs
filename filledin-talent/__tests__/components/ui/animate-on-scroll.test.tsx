import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AnimateOnScroll, FadeIn, SlideUp } from '@/components/ui/animate-on-scroll'

describe('AnimateOnScroll Component', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  it('renders children without crashing', () => {
    render(
      <AnimateOnScroll>
        <div>Test Content</div>
      </AnimateOnScroll>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <AnimateOnScroll className="custom-class">
        <div>Test</div>
      </AnimateOnScroll>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('uses correct transform for "up" direction', () => {
    render(
      <AnimateOnScroll direction="up">
        <div>Test</div>
      </AnimateOnScroll>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ transform: 'translate3d(0, 50px, 0)' })
  })

  it('uses correct transform for "down" direction', () => {
    render(
      <AnimateOnScroll direction="down">
        <div>Test</div>
      </AnimateOnScroll>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ transform: 'translate3d(0, -50px, 0)' })
  })

  it('uses correct transform for "left" direction', () => {
    render(
      <AnimateOnScroll direction="left">
        <div>Test</div>
      </AnimateOnScroll>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ transform: 'translate3d(50px, 0, 0)' })
  })

  it('uses correct transform for "right" direction', () => {
    render(
      <AnimateOnScroll direction="right">
        <div>Test</div>
      </AnimateOnScroll>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ transform: 'translate3d(-50px, 0, 0)' })
  })
})

describe('FadeIn Component', () => {
  beforeEach(() => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  it('renders children correctly', () => {
    render(
      <FadeIn>
        <div>Fade Content</div>
      </FadeIn>
    )
    expect(screen.getByText('Fade Content')).toBeInTheDocument()
  })

  it('applies fade-in animation styles', () => {
    render(
      <FadeIn duration={0.5}>
        <div>Test</div>
      </FadeIn>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ opacity: '0' })
    expect(container).toHaveStyle({ transform: 'translate3d(0, 0, 0)' })
  })
})

describe('SlideUp Component', () => {
  beforeEach(() => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  it('renders children correctly', () => {
    render(
      <SlideUp>
        <div>Slide Content</div>
      </SlideUp>
    )
    expect(screen.getByText('Slide Content')).toBeInTheDocument()
  })

  it('applies slide-up animation styles', () => {
    render(
      <SlideUp duration={0.6}>
        <div>Test</div>
      </SlideUp>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveStyle({ transform: 'translate3d(0, 50px, 0)' })
  })
})
