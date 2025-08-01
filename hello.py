def greet(name="World"):
    """
    A simple greeting function
    
    Args:
        name (str): Name to greet, defaults to "World"
    
    Returns:
        str: Greeting message
    """
    return f"Hello, {name}!"

def main():
    print(greet())
    print(greet("Python Developer"))

if __name__ == "__main__":
    main()