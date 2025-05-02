
export interface Stack<T> {
    /**
     * Pushes an element onto the top of the stack.
     * @param item The element to push.
     */
    push(item: T): void;
  
    /**
     * Removes and returns the top element of the stack.
     * Throws an error if the stack is empty.
     * @returns The popped element.
     */
    pop(): T;
  
    /**
     * Returns the top element without removing it.
     * Throws an error if the stack is empty.
     * @returns The top element.
     */
    peek(): T;
  
    /**
     * Returns whether the stack is empty.
     * @returns True if empty, false otherwise.
     */
    isEmpty(): boolean;
  
    /**
     * Returns the number of elements in the stack.
     * @returns The stack size.
     */
    size(): number;
  
    /**
     * Removes all elements from the stack.
     */
    clear(): void;

    /**
     * Removes all elements from the stack.
     */
    copy(): Stack<T>;
  }
  
  /**
   * Array-backed implementation of the Stack interface.
   */
  export class ArrayStack<T> implements Stack<T> {
    
    private items: T[] = [];
  
    push(item: T): void {
      this.items.push(item);
    }
  
    pop(): T {
      if (this.isEmpty()) {
        throw new Error("Stack underflow: cannot pop from an empty stack.");
      }
      return this.items.pop() as T;
    }
  
    peek(): T {
      if (this.isEmpty()) {
        throw new Error("Stack is empty: cannot peek.");
      }
      return this.items[this.items.length - 1];
    }
  
    isEmpty(): boolean {
      return this.items.length === 0;
    }
  
    size(): number {
      return this.items.length;
    }
  
    clear(): void {
      this.items = [];
    }
  
    /**
     * Returns a copy of the internal array representing the stack.
     */
    toArray(): T[] {
      return [...this.items];
    }

    copy(): ArrayStack<T> {
        const n = new ArrayStack<T>()
        this.items.forEach(item => n.push(item))
        return n
    }

  }
  
  /**
 * Node of a singly linked list.
 */
class ListNode<T> {
    value: T;
    next: ListNode<T> | null = null;
  
    constructor(value: T) {
      this.value = value;
    }
  }

  export class LinkedListStack<T> implements Stack<T> {
    private head: ListNode<T> | null = null;
    private length: number = 0;
  
    /**
     * Pushes an element onto the top of the stack.
     * @param item The element to push.
     */
    push(item: T): void {
      const node = new ListNode(item);
      node.next = this.head;
      this.head = node;
      this.length++;
    }
  
    /**
     * Removes and returns the top element of the stack.
     * Throws an error if the stack is empty.
     * @returns The popped element.
     */
    pop(): T {
      if (this.isEmpty()) {
        throw new Error("Stack underflow: cannot pop from an empty stack.");
      }
      const node = this.head as ListNode<T>;
      this.head = node.next;
      this.length--;
      return node.value;
    }
  
    /**
     * Returns the top element without removing it.
     * Throws an error if the stack is empty.
     * @returns The top element.
     */
    peek(): T {
      if (this.isEmpty()) {
        throw new Error("Stack is empty: cannot peek.");
      }
      return (this.head as ListNode<T>).value;
    }
  
    /**
     * Returns whether the stack is empty.
     * @returns True if empty, false otherwise.
     */
    isEmpty(): boolean {
      return this.head === null;
    }
  
    /**
     * Returns the number of elements in the stack.
     * @returns The stack size.
     */
    size(): number {
      return this.length;
    }
  
    /**
     * Removes all elements from the stack.
     */
    clear(): void {
      this.head = null;
      this.length = 0;
    }
  
    /**
     * Converts stack to an array (top element first).
     */
    toArray(): T[] {
      const result: T[] = [];
      let current = this.head;
      while (current) {
        result.push(current.value);
        current = current.next;
      }
      return result;
    }

    copy(): LinkedListStack<T> {
        const n = new LinkedListStack<T>()
        let node: ListNode<T> | null = this.head
        while (node != null) {
            n.push(node.value)
            node = node.next
        }
        return n
    }
  }