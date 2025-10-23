import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faLock, faEnvelope, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faLinkedin, faAmazon } from "@fortawesome/free-brands-svg-icons";

// Register only the icons your app will use
library.add(faUser, faLock, faEnvelope, faRightFromBracket, faFacebook, faLinkedin, faAmazon);

export { library };
