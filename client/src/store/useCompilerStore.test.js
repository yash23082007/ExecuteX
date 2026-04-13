import { describe, it, expect, beforeEach } from 'vitest';
import useCompilerStore from './useCompilerStore';

describe('useCompilerStore', () => {
  beforeEach(() => {
    useCompilerStore.getState().setCode('');
    useCompilerStore.getState().clearOutput();
    useCompilerStore.getState().executionHistory = [];
  });

  it('updates code correctly', () => {
    useCompilerStore.getState().setCode('print("hello")');
    expect(useCompilerStore.getState().code).toBe('print("hello")');
    expect(useCompilerStore.getState().isForked).toBe(false);
  });

  it('clears output properly', () => {
    useCompilerStore.setState({ output: 'Hello', hasError: true });
    useCompilerStore.getState().clearOutput();
    expect(useCompilerStore.getState().output).toBe('');
    expect(useCompilerStore.getState().hasError).toBe(false);
  });

  it('toggles themes', () => {
    const initTheme = useCompilerStore.getState().theme;
    useCompilerStore.getState().toggleTheme();
    expect(useCompilerStore.getState().theme).not.toBe(initTheme);
  });
});
