import { Button, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { signOut } from "firebase/auth";

const { Title } = Typography;

function Home(props) {
  const [merchantId, setMerchantId] = useState(undefined);
  const [genMerchIdLoading, setGenMerchIdLoading] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState("");
  const [updateMerchantAddrLoading, setUpdateMerchantAddrLoading] =
    useState(false);

  useEffect(() => {
    getDoc(doc(FIRESTORE_DB, "test-merchant", props.user.uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const { merchantId, merchantAddress } = snapshot.data();
          setMerchantId(merchantId);
          setMerchantAddress(merchantAddress ?? "");
        }
      })
      .catch(console.error);
  }, [props.user]);

  async function genMerchId() {
    setGenMerchIdLoading(true);

    // generate id
    const nanoId = nanoid();

    try {
      await setDoc(
        doc(FIRESTORE_DB, "test-merchant", props.user.uid),
        {
          merchantId: nanoId,
        },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
      setGenMerchIdLoading(false);
      return;
    }

    setGenMerchIdLoading(false);
    setMerchantId(nanoid);
  }

  async function updateAddr() {
    setUpdateMerchantAddrLoading(true);

    try {
      await setDoc(
        doc(FIRESTORE_DB, "test-merchant", props.user.uid),
        {
          merchantAddress: merchantAddress,
        },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
    }

    setUpdateMerchantAddrLoading(false);
  }

  function handleSignOut() {
    signOut(FIREBASE_AUTH)
      .catch(console.error);
  }

  const merchantIdMessage = merchantId
    ? `Your Merchant ID is ${merchantId}`
    : "Please generate a merchant ID";

  const genIdButton = merchantId ? (
    <></>
  ) : (
    <Button style={{ width: "100%", marginBottom: "15px" }} loading={genMerchIdLoading} type="primary" onClick={genMerchId}>
      Generate Merchant ID
    </Button>
  );

  return (
    <div className="home-page">
      <Title level={2}>{merchantIdMessage}</Title>
      {genIdButton}
      <div style={{ display: "flex" }}>
        <Input
          size="large"
          placeholder="Your Polygon Address (to receive USDC)"
          value={merchantAddress}
          onChange={(e) => setMerchantAddress(e.target.value)}
        />
        <Button
          size="large"
          type="primary"
          onClick={updateAddr}
          loading={updateMerchantAddrLoading}
        >
          Update
        </Button>
      </div>
      <Button style={{ width: "100%", marginTop: "30px" }} onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}

export default Home;
