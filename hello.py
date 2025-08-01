def greet(name="World"):
    """
    A simple greeting function that says hello
    Args:
        name (str): Name of the person to greet. Defaults to "World"
    Returns:
        str: Greeting message
    """
    return f"Hello, {name}!"

def main():
    print(greet())
    print(greet("GitHub"))

if __name__ == "__main__":
    main()