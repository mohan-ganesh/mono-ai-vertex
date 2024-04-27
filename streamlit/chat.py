import streamlit as st
import requests
from bs4 import BeautifulSoup

# Function to send request to the endpoint and parse HTML tags
def send_request_and_render_response(user_input, conversation):
    # JSON payload for the POST request
    payload = {"query": user_input}
    
    # Send a POST request to the endpoint with JSON payload and content type set to JSON
    response = requests.post("https://vertex-serach-api-sn5rsq6dda-uc.a.run.app/api/v1/conversation", json=payload)
    
    if response.status_code == 200:
        # Parse JSON response
        json_response = response.json()
        
        # Extract the modelResponse from the response
        model_response = json_response.get("modelResponse", {})
        
        # Extract the message from the modelResponse
        message = model_response.get("answer", "")  # Change attribute name to "answer"
        
        # Append the user input and model response to the conversation
        conversation.append({"user_input": user_input, "message": message})
        
        # Render conversation
        render_conversation(conversation)
    else:
        st.error(f"Error: {response.status_code}. Failed to fetch response.")

# Function to render conversation
def render_conversation(conversation):
    # Reverse the conversation list to display messages from bottom to top
    for entry in reversed(conversation):
        user_input = entry["user_input"]
        message = entry["message"]
        
        st.write(f"User: {user_input}")
        
        # Check if message contains HTML markup
        if "<" in message and ">" in message:
            # Parse HTML markup using BeautifulSoup
            soup = BeautifulSoup(message, "html.parser")
            # Render parsed HTML
            st.markdown(str(soup))
        else:
            # Render plain text message
            st.write(f"Bot: {message}")

# Streamlit app layout
def main():
    st.title("Streamlit Chat Application")
    
    st.write("Welcome to the Streamlit Chat Application! Enter your message below and press Enter to send it.")
    
    # Initialize conversation list if not already initialized
    if "conversation" not in st.session_state:
        st.session_state.conversation = []
    
    # Render conversation
    render_conversation(st.session_state.conversation)
    
    # Text area for user's message
    user_input = st.text_area("Enter your message:")
    
    # Button to send message
    if st.button("Send Message"):
        # Call function to send request and render response
        send_request_and_render_response(user_input, st.session_state.conversation)

# Run the app
if __name__ == "__main__":
    main()
