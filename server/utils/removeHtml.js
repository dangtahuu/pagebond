function removeHtmlTags(input) {
    return input.replace(/<\/?[^>]+(>|$)/g, "");
  }

export default removeHtmlTags