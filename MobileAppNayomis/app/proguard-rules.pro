# Retrofit interfaces and Kotlin serialization metadata are retained by their
# libraries' consumer rules. Keep API error DTO serializers available to R8.
-keepattributes Signature,InnerClasses,EnclosingMethod
-keep class com.nayomis.waterfront.core.network.dto.**$$serializer { *; }
