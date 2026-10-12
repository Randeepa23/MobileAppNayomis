package com.nayomis.waterfront

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.nayomis.waterfront.app.navigation.NayomisApp
import com.nayomis.waterfront.core.designsystem.theme.NayomisTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NayomisTheme { NayomisApp() }
        }
    }
}
