/**
 * Database Types - Auto-generated from PostgreSQL schema
 * Generated: 2024-12-09
 *
 * These types match the Supabase database schema exactly.
 * Use Row types for database responses, Insert for creating, Update for patching.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      activity_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          display_order: number | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      activity_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values: Json | null;
          new_values: Json | null;
          user_id: string | null;
          ip_address: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values?: Json | null;
          new_values?: Json | null;
          user_id?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          user_id?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
        };
      };
      add_ons: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          is_active: boolean | null;
          max_quantity: number | null;
          images: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          is_active?: boolean | null;
          max_quantity?: number | null;
          images?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          is_active?: boolean | null;
          max_quantity?: number | null;
          images?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blog_authors: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          bio: string | null;
          avatar_url: string | null;
          social_links: Json | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          social_links?: Json | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          social_links?: Json | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blog_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blog_post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      blog_post_translations: {
        Row: {
          id: string;
          post_id: string;
          locale: string;
          slug_localized: string;
          title: string;
          excerpt: string | null;
          body_rich: Json;
          cover_image_url: string | null;
          cover_alt_text: string | null;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
          noindex: boolean | null;
          faq_json: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          locale: string;
          slug_localized: string;
          title: string;
          excerpt?: string | null;
          body_rich?: Json;
          cover_image_url?: string | null;
          cover_alt_text?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          noindex?: boolean | null;
          faq_json?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          locale?: string;
          slug_localized?: string;
          title?: string;
          excerpt?: string | null;
          body_rich?: Json;
          cover_image_url?: string | null;
          cover_alt_text?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          noindex?: boolean | null;
          faq_json?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          category_id: string | null;
          author_id: string | null;
          status: string;
          featured: boolean | null;
          views: number | null;
          reading_minutes: number | null;
          scheduled_at: string | null;
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          author_id?: string | null;
          status?: string;
          featured?: boolean | null;
          views?: number | null;
          reading_minutes?: number | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          author_id?: string | null;
          status?: string;
          featured?: boolean | null;
          views?: number | null;
          reading_minutes?: number | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blog_tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_ids: string[] | null;
          check_in: string;
          check_out: string;
          room_type: string | null;
          guests: number | null;
          total_amount: number | null;
          payment_status: string | null;
          status: string | null;
          source: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          pre_trip_email_sent_at: string | null;
          post_trip_email_sent_at: string | null;
          pre_trip_email_days_before: number | null;
          post_trip_email_days_after: number | null;
          email_preferences: Json | null;
          dietary_requirements: string | null;
          special_requests: string | null;
        };
        Insert: {
          id?: string;
          client_ids?: string[] | null;
          check_in: string;
          check_out: string;
          room_type?: string | null;
          guests?: number | null;
          total_amount?: number | null;
          payment_status?: string | null;
          status?: string | null;
          source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          pre_trip_email_sent_at?: string | null;
          post_trip_email_sent_at?: string | null;
          pre_trip_email_days_before?: number | null;
          post_trip_email_days_after?: number | null;
          email_preferences?: Json | null;
          dietary_requirements?: string | null;
          special_requests?: string | null;
        };
        Update: {
          id?: string;
          client_ids?: string[] | null;
          check_in?: string;
          check_out?: string;
          room_type?: string | null;
          guests?: number | null;
          total_amount?: number | null;
          payment_status?: string | null;
          status?: string | null;
          source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          pre_trip_email_sent_at?: string | null;
          post_trip_email_sent_at?: string | null;
          pre_trip_email_days_before?: number | null;
          post_trip_email_days_after?: number | null;
          email_preferences?: Json | null;
          dietary_requirements?: string | null;
          special_requests?: string | null;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          event_type: string | null;
          location: string | null;
          color: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          event_type?: string | null;
          location?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          event_type?: string | null;
          location?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          last_booking_date: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          brand: string;
          registration_date: string | null;
          socials: Json | null;
          status: string | null;
          archived_at: string | null;
          vip: boolean | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          last_booking_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          brand?: string;
          registration_date?: string | null;
          socials?: Json | null;
          status?: string | null;
          archived_at?: string | null;
          vip?: boolean | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          last_booking_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          brand?: string;
          registration_date?: string | null;
          socials?: Json | null;
          status?: string | null;
          archived_at?: string | null;
          vip?: boolean | null;
          deleted_at?: string | null;
        };
      };
      cms_settings: {
        Row: {
          id: number;
          site_name: string | null;
          site_description: string | null;
          default_language: string | null;
          enable_cache: boolean | null;
          cache_duration: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          site_name?: string | null;
          site_description?: string | null;
          default_language?: string | null;
          enable_cache?: boolean | null;
          cache_duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          site_name?: string | null;
          site_description?: string | null;
          default_language?: string | null;
          enable_cache?: boolean | null;
          cache_duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      booking_widget_settings: {
        Row: {
          id: string;
          experience_type: string;
          price_from: number;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          experience_type: string;
          price_from: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          experience_type?: string;
          price_from?: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: string | null;
          admin_notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: string | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: string | null;
          admin_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      cta_buttons: {
        Row: {
          id: string;
          location: string;
          text: string;
          link: string;
          style: string | null;
          is_active: boolean | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          location: string;
          text: string;
          link: string;
          style?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          location?: string;
          text?: string;
          link?: string;
          style?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      email_logs: {
        Row: {
          id: string;
          booking_id: string | null;
          client_id: string | null;
          email_type: string;
          recipient_email: string;
          subject: string | null;
          template_name: string | null;
          sent_at: string | null;
          status: string | null;
          error_message: string | null;
          resend_message_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          client_id?: string | null;
          email_type: string;
          recipient_email: string;
          subject?: string | null;
          template_name?: string | null;
          sent_at?: string | null;
          status?: string | null;
          error_message?: string | null;
          resend_message_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          client_id?: string | null;
          email_type?: string;
          recipient_email?: string;
          subject?: string | null;
          template_name?: string | null;
          sent_at?: string | null;
          status?: string | null;
          error_message?: string | null;
          resend_message_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
      };
      experiences: {
        Row: {
          id: string;
          title: string;
          image_url: string | null;
          category: string | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          description: string | null;
          icon: string | null;
          availability_tier: string | null;
          display_order: number | null;
          hero_video_url: string | null;
          hero_image_url: string | null;
          features: Json | null;
        };
        Insert: {
          id?: string;
          title: string;
          image_url?: string | null;
          category?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          description?: string | null;
          icon?: string | null;
          availability_tier?: string | null;
          display_order?: number | null;
          hero_video_url?: string | null;
          hero_image_url?: string | null;
          features?: Json | null;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string | null;
          category?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          description?: string | null;
          icon?: string | null;
          availability_tier?: string | null;
          display_order?: number | null;
          hero_video_url?: string | null;
          hero_image_url?: string | null;
          features?: Json | null;
        };
      };
      external_calendar_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          event_type: string | null;
          location: string | null;
          color: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          event_type?: string | null;
          location?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          event_type?: string | null;
          location?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      faq_items: {
        Row: {
          id: string;
          page_slug: string;
          category: string | null;
          question: string;
          answer: string;
          order_index: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          page_slug: string;
          category?: string | null;
          question: string;
          answer: string;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          page_slug?: string;
          category?: string | null;
          question?: string;
          answer?: string;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      homepage_content: {
        Row: {
          id: string;
          section: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          content: string | null;
          image_url: string | null;
          video_url: string | null;
          video_id: string | null;
          link_url: string | null;
          link_text: string | null;
          is_active: boolean | null;
          order_index: number | null;
          cards: Json | null;
          booking_data: Json | null;
          testimonials: Json | null;
          facilities: Json | null;
          google_rating: Json | null;
          blog_config: Json | null;
          created_at: string | null;
          updated_at: string | null;
          section_type: string | null;
        };
        Insert: {
          id?: string;
          section: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          content?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          video_id?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          cards?: Json | null;
          booking_data?: Json | null;
          testimonials?: Json | null;
          facilities?: Json | null;
          google_rating?: Json | null;
          blog_config?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          section_type?: string | null;
        };
        Update: {
          id?: string;
          section?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          content?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          video_id?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          cards?: Json | null;
          booking_data?: Json | null;
          testimonials?: Json | null;
          facilities?: Json | null;
          google_rating?: Json | null;
          blog_config?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          section_type?: string | null;
        };
      };
      homepage_sections: {
        Row: {
          id: string;
          section_type: string;
          title: string | null;
          subtitle: string | null;
          description: string | null;
          content: Json | null;
          video_url: string | null;
          background_image: string | null;
          link_url: string | null;
          link_text: string | null;
          is_active: boolean | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          section_type: string;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          content?: Json | null;
          video_url?: string | null;
          background_image?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          section_type?: string;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          content?: Json | null;
          video_url?: string | null;
          background_image?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          booking_id: string;
          invoice_number: string;
          amount: number;
          currency: string | null;
          status: string;
          due_date: string | null;
          sent_date: string | null;
          paid_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          invoice_number: string;
          amount: number;
          currency?: string | null;
          status?: string;
          due_date?: string | null;
          sent_date?: string | null;
          paid_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          invoice_number?: string;
          amount?: number;
          currency?: string | null;
          status?: string;
          due_date?: string | null;
          sent_date?: string | null;
          paid_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      media_library: {
        Row: {
          id: string;
          filename: string;
          original_name: string;
          file_type: string;
          file_size: number | null;
          supabase_path: string;
          public_url: string | null;
          alt_text: string | null;
          tags: Json | null;
          category: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          filename: string;
          original_name: string;
          file_type: string;
          file_size?: number | null;
          supabase_path: string;
          public_url?: string | null;
          alt_text?: string | null;
          tags?: Json | null;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          filename?: string;
          original_name?: string;
          file_type?: string;
          file_size?: number | null;
          supabase_path?: string;
          public_url?: string | null;
          alt_text?: string | null;
          tags?: Json | null;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      navigation_items: {
        Row: {
          id: string;
          name: string;
          path: string;
          order_index: number;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          path: string;
          order_index: number;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          path?: string;
          order_index?: number;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      page_content: {
        Row: {
          id: string;
          page_slug: string;
          section: string;
          title: string | null;
          content: string | null;
          video_url: string | null;
          image_url: string | null;
          json_content: Json | null;
          is_active: boolean | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
          section_name: string;
          section_type: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          page_slug: string;
          section: string;
          title?: string | null;
          content?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          json_content?: Json | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          section_name: string;
          section_type?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          page_slug?: string;
          section?: string;
          title?: string | null;
          content?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          json_content?: Json | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          section_name?: string;
          section_type?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      page_sections: {
        Row: {
          id: string;
          page_slug: string;
          section_type: string;
          content: Json;
          order_index: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          page_slug: string;
          section_type: string;
          content?: Json;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          page_slug?: string;
          section_type?: string;
          content?: Json;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: Json;
          published: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: Json;
          published?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: Json;
          published?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      pages_meta: {
        Row: {
          id: string;
          slug: string;
          title: string;
          meta_description: string | null;
          meta_keywords: string | null;
          og_image: string | null;
          is_published: boolean | null;
          last_edited_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          meta_description?: string | null;
          meta_keywords?: string | null;
          og_image?: string | null;
          is_published?: boolean | null;
          last_edited_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          meta_description?: string | null;
          meta_keywords?: string | null;
          og_image?: string | null;
          is_published?: boolean | null;
          last_edited_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          currency: string | null;
          payment_method: string;
          payment_status: string;
          transaction_id: string | null;
          payment_date: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          refund_amount: number | null;
          refund_reason: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          currency?: string | null;
          payment_method: string;
          payment_status?: string;
          transaction_id?: string | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          amount?: number;
          currency?: string | null;
          payment_method?: string;
          payment_status?: string;
          transaction_id?: string | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
        };
      };
      room_assignments: {
        Row: {
          id: string;
          room_id: string;
          client_id: string;
          booking_id: string | null;
          surf_camp_id: string | null;
          enrollment_id: string | null;
          check_in_date: string;
          check_out_date: string;
          bed_number: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          client_id: string;
          booking_id?: string | null;
          surf_camp_id?: string | null;
          enrollment_id?: string | null;
          check_in_date: string;
          check_out_date: string;
          bed_number?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          client_id?: string;
          booking_id?: string | null;
          surf_camp_id?: string | null;
          enrollment_id?: string | null;
          check_in_date?: string;
          check_out_date?: string;
          bed_number?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          capacity: number;
          booking_type: string;
          pricing: Json;
          amenities: string[] | null;
          images: string[] | null;
          bed_types: string[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          capacity?: number;
          booking_type?: string;
          pricing?: Json;
          amenities?: string[] | null;
          images?: string[] | null;
          bed_types?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          capacity?: number;
          booking_type?: string;
          pricing?: Json;
          amenities?: string[] | null;
          images?: string[] | null;
          bed_types?: string[] | null;
        };
      };
      surf_camp_enrollments: {
        Row: {
          id: string;
          surf_camp_id: string;
          client_id: string;
          participant_name: string;
          participant_email: string;
          participant_phone: string | null;
          status: string | null;
          payment_status: string | null;
          total_amount: number | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          skill_level: string | null;
          dietary_restrictions: string | null;
          emergency_contact: Json | null;
          enrolled_at: string | null;
          booking_id: string | null;
        };
        Insert: {
          id?: string;
          surf_camp_id: string;
          client_id: string;
          participant_name: string;
          participant_email: string;
          participant_phone?: string | null;
          status?: string | null;
          payment_status?: string | null;
          total_amount?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          skill_level?: string | null;
          dietary_restrictions?: string | null;
          emergency_contact?: Json | null;
          enrolled_at?: string | null;
          booking_id?: string | null;
        };
        Update: {
          id?: string;
          surf_camp_id?: string;
          client_id?: string;
          participant_name?: string;
          participant_email?: string;
          participant_phone?: string | null;
          status?: string | null;
          payment_status?: string | null;
          total_amount?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          skill_level?: string | null;
          dietary_restrictions?: string | null;
          emergency_contact?: Json | null;
          enrolled_at?: string | null;
          booking_id?: string | null;
        };
      };
      surf_camps: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          price: number;
          available_spots: number;
          total_spots: number;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          images: string[] | null;
          includes: string[] | null;
          level: string | null;
          category: string | null;
          location: string | null;
          max_participants: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          price?: number;
          available_spots?: number;
          total_spots?: number;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          images?: string[] | null;
          includes?: string[] | null;
          level?: string | null;
          category?: string | null;
          location?: string | null;
          max_participants?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          price?: number;
          available_spots?: number;
          total_spots?: number;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          images?: string[] | null;
          includes?: string[] | null;
          level?: string | null;
          category?: string | null;
          location?: string | null;
          max_participants?: number | null;
        };
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          rating: number;
          text: string;
          image_url: string | null;
          verified: boolean | null;
          time_ago: string | null;
          is_active: boolean | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
          author_email: string | null;
          author_image: string | null;
          is_featured: boolean | null;
          content: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          author_name: string;
          rating: number;
          text: string;
          image_url?: string | null;
          verified?: boolean | null;
          time_ago?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_email?: string | null;
          author_image?: string | null;
          is_featured?: boolean | null;
          content?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          author_name?: string;
          rating?: number;
          text?: string;
          image_url?: string | null;
          verified?: boolean | null;
          time_ago?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_email?: string | null;
          author_image?: string | null;
          is_featured?: boolean | null;
          content?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases for common use cases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Entity type exports for direct import
export type ActivityCategory = Tables<'activity_categories'>;
export type ActivityLog = Tables<'activity_log'>;
export type AddOn = Tables<'add_ons'>;
export type BlogAuthor = Tables<'blog_authors'>;
export type BlogCategory = Tables<'blog_categories'>;
export type BlogPostTag = Tables<'blog_post_tags'>;
export type BlogPostTranslation = Tables<'blog_post_translations'>;
export type BlogPost = Tables<'blog_posts'>;
export type BlogTag = Tables<'blog_tags'>;
export type Booking = Tables<'bookings'>;
export type BookingWidgetSettings = Tables<'booking_widget_settings'>;
export type CalendarEvent = Tables<'calendar_events'>;
export type Client = Tables<'clients'>;
export type CmsSettings = Tables<'cms_settings'>;
export type ContactSubmission = Tables<'contact_submissions'>;
export type CtaButton = Tables<'cta_buttons'>;
export type EmailLog = Tables<'email_logs'>;
export type Experience = Tables<'experiences'>;
export type ExternalCalendarEvent = Tables<'external_calendar_events'>;
export type FaqItem = Tables<'faq_items'>;
export type HomepageContent = Tables<'homepage_content'>;
export type HomepageSection = Tables<'homepage_sections'>;
export type Invoice = Tables<'invoices'>;
export type MediaLibraryItem = Tables<'media_library'>;
export type NavigationItem = Tables<'navigation_items'>;
export type PageContent = Tables<'page_content'>;
export type PageSection = Tables<'page_sections'>;
export type Page = Tables<'pages'>;
export type PageMeta = Tables<'pages_meta'>;
export type Payment = Tables<'payments'>;
export type RoomAssignment = Tables<'room_assignments'>;
export type Room = Tables<'rooms'>;
export type SurfCampEnrollment = Tables<'surf_camp_enrollments'>;
export type SurfCamp = Tables<'surf_camps'>;
export type Testimonial = Tables<'testimonials'>;

// Insert type exports
export type InsertActivityCategory = InsertTables<'activity_categories'>;
export type InsertActivityLog = InsertTables<'activity_log'>;
export type InsertAddOn = InsertTables<'add_ons'>;
export type InsertBlogAuthor = InsertTables<'blog_authors'>;
export type InsertBlogCategory = InsertTables<'blog_categories'>;
export type InsertBlogPostTag = InsertTables<'blog_post_tags'>;
export type InsertBlogPostTranslation = InsertTables<'blog_post_translations'>;
export type InsertBlogPost = InsertTables<'blog_posts'>;
export type InsertBlogTag = InsertTables<'blog_tags'>;
export type InsertBooking = InsertTables<'bookings'>;
export type InsertBookingWidgetSettings = InsertTables<'booking_widget_settings'>;
export type InsertCalendarEvent = InsertTables<'calendar_events'>;
export type InsertClient = InsertTables<'clients'>;
export type InsertCmsSettings = InsertTables<'cms_settings'>;
export type InsertContactSubmission = InsertTables<'contact_submissions'>;
export type InsertCtaButton = InsertTables<'cta_buttons'>;
export type InsertEmailLog = InsertTables<'email_logs'>;
export type InsertExperience = InsertTables<'experiences'>;
export type InsertExternalCalendarEvent = InsertTables<'external_calendar_events'>;
export type InsertFaqItem = InsertTables<'faq_items'>;
export type InsertHomepageContent = InsertTables<'homepage_content'>;
export type InsertHomepageSection = InsertTables<'homepage_sections'>;
export type InsertInvoice = InsertTables<'invoices'>;
export type InsertMediaLibraryItem = InsertTables<'media_library'>;
export type InsertNavigationItem = InsertTables<'navigation_items'>;
export type InsertPageContent = InsertTables<'page_content'>;
export type InsertPageSection = InsertTables<'page_sections'>;
export type InsertPage = InsertTables<'pages'>;
export type InsertPageMeta = InsertTables<'pages_meta'>;
export type InsertPayment = InsertTables<'payments'>;
export type InsertRoomAssignment = InsertTables<'room_assignments'>;
export type InsertRoom = InsertTables<'rooms'>;
export type InsertSurfCampEnrollment = InsertTables<'surf_camp_enrollments'>;
export type InsertSurfCamp = InsertTables<'surf_camps'>;
export type InsertTestimonial = InsertTables<'testimonials'>;

// Update type exports
export type UpdateActivityCategory = UpdateTables<'activity_categories'>;
export type UpdateActivityLog = UpdateTables<'activity_log'>;
export type UpdateAddOn = UpdateTables<'add_ons'>;
export type UpdateBlogAuthor = UpdateTables<'blog_authors'>;
export type UpdateBlogCategory = UpdateTables<'blog_categories'>;
export type UpdateBlogPostTag = UpdateTables<'blog_post_tags'>;
export type UpdateBlogPostTranslation = UpdateTables<'blog_post_translations'>;
export type UpdateBlogPost = UpdateTables<'blog_posts'>;
export type UpdateBlogTag = UpdateTables<'blog_tags'>;
export type UpdateBooking = UpdateTables<'bookings'>;
export type UpdateBookingWidgetSettings = UpdateTables<'booking_widget_settings'>;
export type UpdateCalendarEvent = UpdateTables<'calendar_events'>;
export type UpdateClient = UpdateTables<'clients'>;
export type UpdateCmsSettings = UpdateTables<'cms_settings'>;
export type UpdateContactSubmission = UpdateTables<'contact_submissions'>;
export type UpdateCtaButton = UpdateTables<'cta_buttons'>;
export type UpdateEmailLog = UpdateTables<'email_logs'>;
export type UpdateExperience = UpdateTables<'experiences'>;
export type UpdateExternalCalendarEvent = UpdateTables<'external_calendar_events'>;
export type UpdateFaqItem = UpdateTables<'faq_items'>;
export type UpdateHomepageContent = UpdateTables<'homepage_content'>;
export type UpdateHomepageSection = UpdateTables<'homepage_sections'>;
export type UpdateInvoice = UpdateTables<'invoices'>;
export type UpdateMediaLibraryItem = UpdateTables<'media_library'>;
export type UpdateNavigationItem = UpdateTables<'navigation_items'>;
export type UpdatePageContent = UpdateTables<'page_content'>;
export type UpdatePageSection = UpdateTables<'page_sections'>;
export type UpdatePage = UpdateTables<'pages'>;
export type UpdatePageMeta = UpdateTables<'pages_meta'>;
export type UpdatePayment = UpdateTables<'payments'>;
export type UpdateRoomAssignment = UpdateTables<'room_assignments'>;
export type UpdateRoom = UpdateTables<'rooms'>;
export type UpdateSurfCampEnrollment = UpdateTables<'surf_camp_enrollments'>;
export type UpdateSurfCamp = UpdateTables<'surf_camps'>;
export type UpdateTestimonial = UpdateTables<'testimonials'>;

// Typed JSON content interfaces for specific tables
export interface RoomPricing {
  standard: number;
  offSeason?: number;
  highSeason?: number;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface EmailPreferences {
  marketing?: boolean;
  reminders?: boolean;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
}

export interface BlogBodyRich {
  type: string;
  content?: Array<{
    type: string;
    text?: string;
    marks?: Array<{ type: string }>;
    content?: unknown[];
  }>;
}

export interface FaqJsonItem {
  question: string;
  answer: string;
}

// Status enums based on common values in the database
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'spam';
export type BlogPostStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type ClientStatus = 'active' | 'inactive' | 'archived';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type RoomAssignmentStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
