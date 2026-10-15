# Component Development Guide

## Overview

This guide provides best practices for developing and extending components in this project.

## Component Structure

### Functional Component Template

```jsx
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleAction = () => {
    // Handler logic
  };

  return (
    <div className="component-name">
      <h2>{prop1}</h2>
      <p>{prop2}</p>
      <button onClick={handleAction}>Action</button>
    </div>
  );
};

export default ComponentName;
```

## Component Best Practices

### 1. Props Validation

```jsx
import PropTypes from 'prop-types';

ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onComplete: PropTypes.func,
};

ComponentName.defaultProps = {
  items: [],
};
```

### 2. Custom Hooks Usage

```jsx
import { useFetch, useForm, useDebounce } from '../hooks';

const MyComponent = () => {
  const { data, loading, error } = useFetch('/api/data');
  const { formData, handleChange, handleSubmit } = useForm(
    { name: '', email: '' },
    onSubmit
  );

  return (
    // Component JSX
  );
};
```

### 3. Context Integration

```jsx
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const { hotel, updateHotel } = useHotel();

  return (
    // Component JSX
  );
};
```

## Styling Components

### CSS Structure

```css
/* ComponentName.css */

.component-name {
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
}

.component-name__header {
  margin-bottom: 1rem;
}

.component-name__content {
  display: flex;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .component-name__content {
    flex-direction: column;
  }
}
```

### Using Theme Variables

```jsx
import { colors, spacing, shadows } from '../styles/theme';

const MyComponent = () => {
  const style = {
    backgroundColor: colors.primary,
    padding: spacing.md,
    boxShadow: shadows.lg,
  };

  return <div style={style}>Content</div>;
};
```

## Common Patterns

### Conditional Rendering

```jsx
const MyComponent = ({ isLoading, hasError, data }) => {
  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <div>Error occurred</div>;

  return <div>{data}</div>;
};
```

### Form Component Pattern

```jsx
const FormComponent = ({ onSubmit }) => {
  const { formData, handleChange, handleSubmit, errors } = useForm(
    { name: '', email: '' },
    onSubmit
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### List Component Pattern

```jsx
const ListComponent = ({ items, onItemClick }) => {
  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

## Performance Optimization

### Memoization

```jsx
import { useMemo, useCallback } from 'react';

const MyComponent = ({ items }) => {
  const processedItems = useMemo(
    () => items.filter(item => item.active),
    [items]
  );

  const handleClick = useCallback((item) => {
    console.log(item);
  }, []);

  return <List items={processedItems} onClick={handleClick} />;
};
```

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

## Testing Components

### Unit Test Example

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders component with text', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Component Checklist

- [ ] Component has clear purpose
- [ ] Props are properly typed/validated
- [ ] Component is responsive
- [ ] Accessibility is considered
- [ ] Error states handled
- [ ] Loading states included
- [ ] CSS is scoped and maintainable
- [ ] Component is tested
- [ ] Documentation is updated

## Creating New Components

1. Create folder: `src/components/YourComponent/`
2. Create files:
   - `YourComponent.jsx`
   - `YourComponent.css`
3. Follow naming conventions
4. Add prop types
5. Document usage
6. Add to exports

## Resources

- React Documentation: https://react.dev
- React Hooks: https://react.dev/reference/react/hooks
- Best Practices: https://react.dev/learn
