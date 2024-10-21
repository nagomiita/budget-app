import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet } from "react-router-dom";
import SideBar from "../common/SideBar";
import { useAppContext } from "@/context/AppContext";
import { collection, getDocs } from "firebase/firestore";
import { Transaction } from "@/types";
import { db } from "@/firebase";
import { isFireStoreError } from "@/utils/errorHandling";

const drawerWidth = 240;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const { setTransactions, setIsLoading } = useAppContext();
  React.useEffect(() => {
    const fetcheTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Transactions"));
        const transactionsData = querySnapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            id: doc.id,
          } as Transaction;
        });
        setTransactions(transactionsData);
      } catch (err) {
        if (isFireStoreError(err)) {
          console.error(err.message);
        } else {
          console.log("クライアント側のエラーです。", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetcheTransactions();
  }, []);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Box
      sx={{
        display: { md: "flex" },
        bgColor: (theme) => theme.palette.grey[100],
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            家計簿アプリ
          </Typography>
        </Toolbar>
      </AppBar>
      <SideBar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
        handleDrawerClose={handleDrawerClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#f5f5f5",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
